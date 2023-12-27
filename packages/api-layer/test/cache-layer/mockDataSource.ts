import * as uuid from 'uuid';
import * as path from 'path';
import faker from '@faker-js/faker';
import * as duckdb from 'duckdb';

import {
  DataResult,
  DataSource,
  ExportOptions,
  ImportOptions,
  RequestParameter,
  VulcanExtensionId,
} from '@vulcan-sql/api-layer';

const db = new duckdb.Database(':memory:');

export const getQueryResults = async (
  sql: string
): Promise<Record<string, any>[]> =>
  new Promise((resolve, reject) => {
    db.wait(() => {
      db.all(sql, (err: any, result: any[]) =>
        err ? reject(err) : resolve(result)
      );
    });
  });

@VulcanExtensionId('mock')
export class MockDataSource extends DataSource {
  private logger = this.getLogger();

  public async execute(): Promise<DataResult> {
    return {} as any;
  }

  public async prepare({ parameterIndex }: RequestParameter) {
    return `$${parameterIndex}`;
  }

  public override getProfiles() {
    return super.getProfiles();
  }

  public override getProfile(name: string) {
    return super.getProfile(name);
  }

  public override async export(options: ExportOptions): Promise<void> {
    const { directory } = options;
    const filepath = path.resolve(directory, `${uuid.v4()}.parquet`);
    const fakeTableName = 'table1';
    const fakeColumns = [
      {
        column: 'id',
        type: 'INTEGER',
      },
      {
        column: 'username',
        type: 'VARCHAR',
      },
      {
        column: 'is_active',
        type: 'BOOLEAN',
      },
    ];

    // create table by fake columns with types
    db.run(
      `CREATE TABLE ${fakeTableName}(${fakeColumns[0].column} ${fakeColumns[0].type}, ${fakeColumns[1].column} ${fakeColumns[1].type}, ${fakeColumns[2].column} ${fakeColumns[2].type})`
    );
    for (let i = 0; i < 10000; i++) {
      db.run(
        `INSERT INTO ${fakeTableName} VALUES (${faker.random.numeric()}, '${faker.random.word()}', ${faker.datatype.boolean()})`
      );
    }

    // export to parquet file and if resolve done, return filepaths
    return await new Promise((resolve, reject) => {
      db.run(
        `COPY ${fakeTableName} TO '${filepath}' (FORMAT 'parquet')`,
        (err: any) => {
          if (err) reject(err);
          this.logger.debug(`Export file to "${filepath}" done`);
          resolve();
        }
      );
    });
  }

  public override async import(options: ImportOptions): Promise<void> {
    const { tableName, directory, schema } = options;
    // read all parquet files in directory by *.parquet
    const folderPath = path.resolve(directory, '*.parquet');
    // create table and if resolve done, return
    return await new Promise((resolve, reject) => {
      db.run(`CREATE SCHEMA IF NOT EXISTS ${schema}`);
      db.run(
        `CREATE OR REPLACE TABLE ${schema}.${tableName} AS SELECT * FROM read_parquet('${folderPath}')`,
        (err: any) => {
          if (err) reject(err);
          this.logger.debug(`Table created, name = ${tableName}`);
          resolve();
        }
      );
    });
  }
}
