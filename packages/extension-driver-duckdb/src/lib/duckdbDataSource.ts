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
} from '@vulcan-sql/core';
import * as path from 'path';
import { buildSQL } from './sqlBuilder';

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

export interface DuckDBOptions {
  'persistent-path'?: string;
  'log-queries'?: boolean;
  'log-parameters'?: boolean;
}

@VulcanExtensionId('duckdb')
export class DuckDBDataSource extends DataSource<any, DuckDBOptions> {
  // Use protected method for unit test
  protected dbMapping = new Map<
    string,
    { db: duckdb.Database; logQueries: boolean; logParameters: boolean }
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
        db = new duckdb.Database(dbPath);
        dbByPath.set(dbPath, db);
      }
      this.dbMapping.set(profile.name, {
        db,
        logQueries: profile.connection?.['log-queries'] || false,
        logParameters: profile.connection?.['log-parameters'] || false,
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
    const { db, ...options } = this.dbMapping.get(profileName)!;
    const builtSQL = buildSQL(sql, operations);
    // create new connection for each query
    const connection = db.connect();
    const statement = connection.prepare(builtSQL);
    const parameters = Array.from(bindParams.values());
    this.logRequest(builtSQL, parameters, options);

    const result = await statement.stream(...parameters);
    const firstChunk = await result.nextChunk();
    return {
      getColumns: () => {
        if (!firstChunk || firstChunk.length === 0) return [];
        return Object.keys(firstChunk[0]).map((columnName) => ({
          name: columnName,
          type: getType(firstChunk[0][columnName as any]),
        }));
      },
      getData: () => {
        const stream = new Readable({
          objectMode: true,
          read() {
            result.nextChunk().then((chunk) => {
              if (!chunk) {
                this.push(null);
                return;
              }
              for (const row of chunk) {
                this.push(row);
              }
            });
          },
        });
        // Send the first chunk
        if (firstChunk) {
          for (const row of firstChunk) {
            stream.push(row);
          }
        } else {
          // If there is no data, close the stream.
          stream.push(null);
        }
        return stream;
      },
    };
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
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

    const { db } = this.dbMapping.get(profileName)!;
    // create new connection for export
    const connection = db.connect();
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
}
