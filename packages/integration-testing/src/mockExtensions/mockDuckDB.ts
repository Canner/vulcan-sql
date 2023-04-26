import * as duckdb from 'duckdb';
import { Stream } from 'stream';
import {
  CacheLayerStoreFormatType,
  DataResult,
  DataSource,
  ExecuteOptions,
  ExportOptions,
  ImportOptions,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/core';

const db = new duckdb.Database(':memory:');

@VulcanExtensionId('duckdb')
export class MockDuckDBDataSource extends DataSource {
  private logger = this.getLogger();

  public static runSQL(sql: string) {
    db.run(sql);
  }
  public async execute({
    statement: sql,
    bindParams,
  }: ExecuteOptions): Promise<DataResult> {
    const statement = db.prepare(sql);
    const parameters = Array.from(bindParams.values());

    const result = await statement.stream(...parameters);
    const firstChunk = await result.nextChunk();
    return {
      getColumns: () => {
        return [];
      },
      getData: () => {
        const stream = new Stream.Readable({
          objectMode: true,
          read() {
            result.nextChunk().then((chunk: any) => {
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

  public override async export(options: ExportOptions): Promise<string[]> {
    const { filepath, sql, type } = options;
    const formatTypeMapper = {
      [CacheLayerStoreFormatType.parquet.toString()]: 'parquet',
    };
    // export to parquet file and if resolve done, return filepaths
    return await new Promise((resolve, reject) => {
      db.run(
        `COPY (${sql}) TO '${filepath}' (FORMAT '${formatTypeMapper[type]}')`,
        (err: any) => {
          if (err) reject(err);
          this.logger.debug(
            `Export to ${formatTypeMapper[type]} file done, path = ${filepath}`
          );
          resolve([filepath]);
        }
      );
    });
  }

  public override async import(options: ImportOptions): Promise<void> {
    const { tableName, filepaths, schema, type } = options;
    // parametrized query string for filepaths => [filepath1, filepath2] => "'filepath1', 'filepath2'"
    const parametrizedPaths = filepaths.map((path) => `'${path}'`).join(', ');
    const formatTypeMapper = {
      [CacheLayerStoreFormatType.parquet.toString()]: `read_parquet([${parametrizedPaths}])`,
    };
    // create table and if resolve done, return
    return await new Promise((resolve, reject) => {
      db.run(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
      db.run(
        `CREATE OR REPLACE TABLE ${schema}.${tableName} AS SELECT * FROM ${formatTypeMapper[type]}`,
        (err: any) => {
          if (err) reject(err);
          this.logger.debug(`Table created, name = ${tableName}`);
          resolve();
        }
      );
    });
  }
}
