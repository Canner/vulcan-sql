import { Readable } from 'stream';
import * as duckdb from 'duckdb';
import {
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
    const statement = db.prepare(builtSQL);
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
    const { filepath, sql, profileName } = options;
    if (!this.dbMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
    const { db } = this.dbMapping.get(profileName)!;
    // export to parquet file
    db.run(
      `COPY (${sql}) TO '${filepath}' (FORMAT 'parquet', ROW_GROUP_SIZE 100000)`,
      () => {
        this.logger.debug(`Export to parquet file done, path = ${filepath}`);
      }
    );
  }

  public override async import(options: ImportOptions) {
    const { tableName, filepath, profileName, schema } = options;
    if (!this.dbMapping.has(profileName)) {
      throw new InternalError(`Profile instance ${profileName} not found`);
    }
    const { db } = this.dbMapping.get(profileName)!;
    // parquet is extension, need to install and load it first.

    db.run(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
    db.run(
      `CREATE TABLE ${schema}.${tableName} AS SELECT * FROM read_parquet(?)`,
      [filepath],
      () => {
        this.logger.debug(`Table created, name = ${tableName}`);
      }
    );
  }
}
