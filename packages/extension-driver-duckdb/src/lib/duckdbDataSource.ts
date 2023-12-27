import { Readable } from 'stream';
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as duckdb from 'duckdb';
import {
  CacheLayerStoreFormatType,
  DataResult,
  DataSource,
  ExecuteOptions,
  ExportOptions,
  ImportOptions,
  InternalError,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/api-layer';
import * as path from 'path';
import { buildSQL, chunkSize } from './sqlBuilder';
import { DuckDBExtensionLoader } from './duckdbExtensionLoader';

const getType = (value: any) => {
  const jsType = typeof value;
  switch (jsType) {
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    default:
      return 'string';
  }
};

// read more configuration in DuckDB document: https://duckdb.org/docs/extensions/httpfs
export interface ConfigurationParameters {
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  // sessionToken: alternative option for accessKeyId and secretAccessKey
  sessionToken?: string;
  endpoint?: string;
  url_style?: string;
  use_ssl?: boolean;
}

export interface DuckDBOptions {
  'persistent-path'?: string;
  'log-queries'?: boolean;
  'log-parameters'?: boolean;
  'configuration-parameters'?: ConfigurationParameters;
}

@VulcanExtensionId('duckdb')
export class DuckDBDataSource extends DataSource<any, DuckDBOptions> {
  // Use protected method for unit test
  protected dbMapping = new Map<
    string,
    {
      db: duckdb.Database;
      logQueries: boolean;
      logParameters: boolean;
      configurationParameters: ConfigurationParameters;
    }
  >();
  private logger = this.getLogger();

  public override async onActivate() {
    const profiles = this.getProfiles().values();

    const dbByPath = new Map<string, duckdb.Database>();
    this.dbMapping = new Map();
    for (const profile of profiles) {
      this.logger.debug(`Create connection for ${profile.name}`);
      const dbPath = profile.connection?.['persistent-path']
        ? path.resolve(process.cwd(), profile.connection['persistent-path'])
        : ':memory:';
      // Only reuse db instance when not using in-memory only db
      let db = dbPath !== ':memory:' ? dbByPath.get(dbPath) : undefined;
      if (!db) {
        db = await this.initDatabase(dbPath);
        dbByPath.set(dbPath, db);
      }
      this.dbMapping.set(profile.name, {
        db,
        logQueries: profile.connection?.['log-queries'] || false,
        logParameters: profile.connection?.['log-parameters'] || false,
        configurationParameters:
          profile.connection?.['configuration-parameters'] || {},
      });
    }
  }

  public async execute({
    statement: sql,
    bindParams,
    profileName,
    operations,
  }: ExecuteOptions): Promise<DataResult> {
    if (!this.dbMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
    const { db, configurationParameters, ...options } =
      this.dbMapping.get(profileName)!;
    const [firstDataSQL, restDataSQL] = buildSQL(sql, operations);

    // create new connection for each query
    const parameters = Array.from(bindParams.values());
    this.logRequest(firstDataSQL, parameters, options);
    if (restDataSQL) this.logRequest(restDataSQL, parameters, options);
    const [firstData, restDataStream] = await this.acquireData(
      firstDataSQL,
      restDataSQL,
      parameters,
      db,
      configurationParameters
    );
    const readable = this.createReadableStream(firstData, restDataStream);
    return {
      getColumns: () => {
        if (!firstData || firstData.length === 0) return [];
        return Object.keys(firstData[0]).map((columnName) => ({
          name: columnName,
          type: getType(firstData[0][columnName as any]),
        }));
      },
      getData: () => {
        return readable;
      },
    };
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }

  private createReadableStream(
    firstData: duckdb.TableData,
    restDataStream: duckdb.QueryResult | undefined
  ) {
    const readable = new Readable({
      objectMode: true,
      read: function () {
        for (const row of firstData) {
          this.push(row);
        }
        this.push(null);
      },
    });
    if (firstData.length >= chunkSize) {
      readable._read = async function () {
        if (restDataStream) {
          for await (const row of restDataStream) {
            this.push(row);
          }
          this.push(null);
        }
      };
      if (firstData) {
        for (const row of firstData) {
          readable.push(row);
        }
      }
    }
    return readable;
  }

  private async acquireData(
    firstDataSql: string,
    restDataSql: string | undefined,
    parameters: any[],
    db: duckdb.Database,
    configurationParameters: ConfigurationParameters
  ) {
    // conn.all() is faster then stream.checkChunk().
    // For the small size data we use conn.all() to get the data at once
    // To limit memory use and prevent server crashes, we will use conn.all() to acquire the initial chunk of data, then conn.stream() to receive the remainder of the data.
    const c1 = db.connect();
    const c2 = db.connect();
    await Promise.all([
      await this.loadExtensions(c1, configurationParameters),
      await this.setExecConfig(c1),
      await this.loadExtensions(c2, configurationParameters),
      await this.setExecConfig(c2),
    ]);

    return await Promise.all([
      new Promise<duckdb.TableData>((resolve, reject) => {
        c1.all(
          firstDataSql,
          ...parameters,
          (err: duckdb.DuckDbError | null, res: duckdb.TableData) => {
            if (err) {
              reject(err);
            }
            resolve(res);
          }
        );
      }),
      new Promise<duckdb.QueryResult | undefined>((resolve, reject) => {
        if (!restDataSql) resolve(undefined);
        try {
          const result = c2.stream(restDataSql, ...parameters);
          resolve(result);
        } catch (err: any) {
          reject(err);
        }
      }),
    ]);
  }

  private logRequest(
    sql: string,
    parameters: string[],
    options: {
      logQueries: boolean;
      logParameters: boolean;
    }
  ) {
    if (options.logQueries) {
      if (options.logParameters) {
        this.logger.info(sql, parameters);
      } else {
        this.logger.info(sql);
      }
    }
  }

  public override async export(options: ExportOptions): Promise<void> {
    const { directory, sql, profileName, type } = options;
    const filepath = path.resolve(directory, `${uuid.v4()}.parquet`);
    if (!this.dbMapping.has(profileName))
      throw new InternalError(`Profile instance ${profileName} not found`);
    // check the directory exists
    if (!fs.existsSync(directory!))
      throw new InternalError(`The directory ${directory} not exists`);

    const { db, configurationParameters } = this.dbMapping.get(profileName)!;
    // create new connection for export
    const connection = db.connect();
    await this.loadExtensions(connection, configurationParameters);
    const formatTypeMapper = {
      [CacheLayerStoreFormatType.parquet.toString()]: 'parquet',
    };
    // export to parquet file and if resolve done, return filepaths
    return await new Promise((resolve, reject) => {
      connection.run(
        `COPY (${sql}) TO '${filepath}' (FORMAT '${formatTypeMapper[type]}')`,
        (err: any) => {
          if (err) reject(err);
          this.logger.debug(`Export file to "${filepath}" done`);
          resolve();
        }
      );
    });
  }

  public override async import(options: ImportOptions): Promise<void> {
    const { tableName, directory, profileName, schema, type, indexes } =
      options;
    if (!this.dbMapping.has(profileName))
      throw new InternalError(`Profile instance ${profileName} not found`);
    // check the directory exists
    if (!fs.existsSync(directory!))
      throw new InternalError(`The directory ${directory} not exists`);

    const { db } = this.dbMapping.get(profileName)!;
    // create new connection for import
    const connection = db.connect();
    // read all parquet files in directory by *.parquet
    const folderPath = path.resolve(directory, '*.parquet');
    const formatTypeMapper = {
      [CacheLayerStoreFormatType.parquet.toString()]: `read_parquet('${folderPath}')`,
    };
    // create table and if resolve done, return
    return await new Promise((resolve, reject) => {
      connection.run(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
      connection.run(
        `CREATE OR REPLACE TABLE ${schema}.${tableName} AS SELECT * FROM ${formatTypeMapper[type]}`,
        (err: any) => {
          if (err) reject(err);
          this.logger.debug(`Table created, name = ${tableName}`);
          // create indexes if set the options
          if (indexes)
            this.createIndexes(connection, schema, tableName, indexes);
          resolve();
        }
      );
    });
  }

  // create indexes for table
  private createIndexes(
    connection: duckdb.Connection,
    schema: string,
    tableName: string,
    indexes: Record<string, string>
  ) {
    Object.entries(indexes).forEach(([index, column]) => {
      // duckdb could not create duplicate index, so here should drop index if exists and create again.
      connection.run(`DROP INDEX IF EXISTS ${index}`);
      connection.run(
        `CREATE INDEX ${index} ON ${schema}.${tableName} (${column})`
      );
    });
  }

  // The dafault duckdb thread is 16
  // Setting thread below your CPU core number may result in enhanced performance, according to our observations.
  // private async setThread(db: duckdb.Database) {
  //   const thread = process.env['DUCKDB_THREADS'];

  //   if (!thread) return;
  //   await new Promise((resolve, reject) => {
  //     db.run(`SET threads=${Number(thread)}`, (err: any) => {
  //       if (err) reject(err);
  //       this.logger.debug(`Set thread to ${thread}`);
  //       resolve(true);
  //     });
  //   });
  // }

  private async initDatabase(dbPath: string) {
    const readonlyMode = process.env['DUCKDB_READONLY_MODE'];
    let db;
    if (readonlyMode) {
      db = new duckdb.Database(dbPath, duckdb.OPEN_READONLY);
      this.logger.debug(`Open database in readonly mode`);
    } else {
      db = new duckdb.Database(dbPath);
      this.logger.debug(`Open database in automatic mode`);
    }
    const conn = db.connect();
    // await this.setThread(db);
    await this.setInitConfig(conn);
    await this.installExtensions(conn);
    await this.getCurrentConfig(conn);
    return db;
  }

  private async setConfigList(conn: duckdb.Connection, configs: string[] | []) {
    if (!configs.length) return;
    await Promise.all(
      configs.map((config) => {
        return new Promise((resolve, reject) => {
          conn.run(`SET ${config}`, (err: any) => {
            if (err) reject(err);
            this.logger.debug(`Set config ${config}`);
            resolve(true);
          });
        });
      })
    );
  }

  private async setInitConfig(conn: duckdb.Connection) {
    // threads=1, dir='path',
    const configListStr = process.env['DUCKDB_INIT_CONFIG'];
    const configs = configListStr?.split(',') || [];
    await this.setConfigList(conn, configs);
  }
  private async setExecConfig(conn: duckdb.Connection) {
    // threads=1, dir='path',
    const configListStr = process.env['DUCKDB_EXEC_CONFIG'];
    const configs = configListStr?.split(',') || [];
    await this.setConfigList(conn, configs);
  }

  private async getCurrentConfig(conn: duckdb.Connection) {
    return await new Promise((resolve, reject) => {
      conn.all('select * from duckdb_settings()', (err: any, res: any) => {
        if (err) reject(err);
        for (const config of res) {
          this.logger.debug(`Duckdb config: ${config.name} = ${config.value}`);
        }
        resolve(true);
      });
    });
  }

  private async installExtensions(
    connection: duckdb.Connection
  ): Promise<void> {
    // allows DuckDB to read remote/write remote files
    return await new Promise((resolve, reject) => {
      connection.run('INSTALL httpfs', (err: any) => {
        if (err) reject(err);
        this.logger.debug('Installed httpfs extension');
        resolve();
      });
    });
  }

  private async loadExtensions(
    connection: duckdb.Connection,
    configurationParameters: ConfigurationParameters
  ) {
    const configurationLoader = new DuckDBExtensionLoader(
      configurationParameters
    );
    await configurationLoader.loadExtension(connection, 'httpfs');
  }
}
