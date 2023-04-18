import { getLogger, streamToArray } from '@vulcan-sql/core';
import { DuckDBDataSource } from '../src';
import * as fs from 'fs';
import * as duckdb from 'duckdb';
import * as path from 'path';
import { ILogObject } from 'tslog';

const testFile = path.resolve(__dirname, 'test.db');

const runQuery = (db: duckdb.Database, sql: string) =>
  new Promise<void>((resolve, reject) => {
    db.run(sql, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });

const getQueryResults = (db: duckdb.Database, sql: string) =>
  new Promise<any[]>((resolve, reject) => {
    db.wait(() => {
      db.all(sql, (err: any, result: any[]) => {
        err ? reject(err) : resolve(result);
      });
    });
  });

const waitForQuery = (db: duckdb.Database) =>
  new Promise<void>((resolve, reject) => {
    db.wait((err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });

// Mock duckdb data source for getting the duckdb instance for unit test
class MockDuckDBDataSource extends DuckDBDataSource {
  public getInstance(profileName: string) {
    return this.dbMapping.get(profileName)?.db;
  }
}

beforeAll(async () => {
  if (fs.existsSync(testFile)) fs.unlinkSync(testFile);
  const db = new duckdb.Database(testFile);
  await runQuery(
    db,
    `create table users (id INTEGER, name VARCHAR, age INTEGER, enabled BOOLEAN);`
  );
  await runQuery(db, `insert into users values(1, 'freda', 18, true);`);
  await runQuery(db, `insert into users values(2, 'william', 180, true);`);
  await runQuery(db, `insert into users values(3, 'ivan', 1800, true);`);
  // some users for testing chunk data (chunk size 1024)
  for (let i = 0; i < 2000; i++) {
    await runQuery(
      db,
      `insert into users values(${i + 4}, 'user${i}', 18000, false);`
    );
  }
}, 20000); // Inserting test data might takes some time

afterAll(async () => {
  const dbFiles = fs
    .readdirSync(__dirname)
    .filter((fileName) => fileName.endsWith('.db'));
  for (const dbFile of dbFiles) fs.unlinkSync(path.resolve(__dirname, dbFile));
});

it('Should work with memory-only database', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null as any, 'duckdb', [
    { name: 'mocked-profile', type: 'duck', allow: '*' },
  ]); // set connection to undefined, test the tolerance
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  bindParams.set(
    await dataSource.prepare({
      parameterIndex: 1,
      value: 123,
      profileName: 'mocked-profile',
    }),
    123
  );
  bindParams.set(
    await dataSource.prepare({
      parameterIndex: 2,
      value: 456,
      profileName: 'mocked-profile',
    }),
    456
  );
  // Act
  const { getColumns, getData } = await dataSource.execute({
    statement: 'select $1::INTEGER + $2::INTEGER as test',
    bindParams,
    operations: {} as any,
    profileName: 'mocked-profile',
  });
  const columns = getColumns();
  const data = await streamToArray(getData());
  // Assert
  expect(columns).toEqual([{ name: 'test', type: 'number' }]);
  expect(data).toEqual([{ test: 579 }]);
});

it('Should work with persistent database', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      connection: {
        'persistent-path': testFile,
      },
      allow: '*',
    },
  ]);
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  bindParams.set('$1', 200);
  // Act
  const { getColumns, getData } = await dataSource.execute({
    statement: 'select * from "users" where age < $1 order by id desc',
    bindParams,
    operations: {} as any,
    profileName: 'mocked-profile',
  });
  const columns = getColumns();
  const data = await streamToArray(getData());
  // Assert
  expect(columns.length).toBe(4);
  expect(columns).toContainEqual({ name: 'id', type: 'number' });
  expect(columns).toContainEqual({ name: 'name', type: 'string' });
  expect(columns).toContainEqual({ name: 'age', type: 'number' });
  expect(columns).toContainEqual({ name: 'enabled', type: 'boolean' });
  expect(data.length).toBe(2);
  expect(data[0]).toEqual({
    id: 2,
    name: 'william',
    age: 180,
    enabled: true,
  });
  expect(data[1]).toEqual({ id: 1, name: 'freda', age: 18, enabled: true });
});

it('Should send correct data with chunks', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      connection: {
        'persistent-path': testFile,
      },
      allow: '*',
    },
  ]);
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'select * from "users" where age order by id',
    bindParams,
    operations: {} as any,
    profileName: 'mocked-profile',
  });
  const data = await streamToArray(getData());
  // Assert
  expect(data.length).toBe(2000 + 3);
  expect(data[0]).toEqual({
    id: 1,
    name: 'freda',
    age: 18,
    enabled: true,
  });
  expect(data[1234]).toEqual({
    id: 1235,
    name: 'user1231',
    age: 18000,
    enabled: false,
  });
});

it('Should throw error from upstream', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      connection: {
        'persistent-path': testFile,
      },
      allow: '*',
    },
  ]);
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  // Act, Assert
  await expect(
    dataSource.execute({
      statement: 'wrong syntax',
      bindParams,
      operations: {} as any,
      profileName: 'mocked-profile',
    })
  ).rejects.toThrow(/^Parser Error: syntax error at or near "wrong"/);
});

it('Should return empty data and column with zero result', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      connection: {
        'persistent-path': testFile,
      },
      allow: '*',
    },
  ]);
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  bindParams.set('$1', 0);
  // Act
  const { getColumns, getData } = await dataSource.execute({
    statement: 'select * from "users" where age < $1',
    bindParams,
    operations: {} as any,
    profileName: 'mocked-profile',
  });
  const columns = getColumns();
  const data = await streamToArray(getData());
  // Assert
  expect(columns.length).toBe(0);
  expect(data.length).toBe(0);
});

it('Should print queries without binding when log-queries = true', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      connection: {
        'log-queries': true,
      },
      allow: '*',
    },
  ]);
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  bindParams.set('$1', 1234);
  const logs: any[][] = [];
  const logger = getLogger({ scopeName: 'CORE' });
  const transport = (logObject: ILogObject) => {
    logs.push(logObject.argumentsArray);
  };
  logger.attachTransport({
    silly: transport,
    debug: transport,
    trace: transport,
    info: transport,
    warn: transport,
    error: transport,
    fatal: transport,
  });
  // Act
  await dataSource.execute({
    statement: 'select $1::INTEGER as test',
    bindParams,
    operations: {} as any,
    profileName: 'mocked-profile',
  });
  // Assert
  expect(logs[0].length).toBe(1);
  expect(logs[0][0]).toBe(`select $1::INTEGER as test`);
});

it('Should print queries with binding when log-queries = true and log-parameters = true', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      connection: {
        'log-queries': true,
        'log-parameters': true,
      },
      allow: '*',
    },
  ]);
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  bindParams.set('$1', 1234);
  const logs: any[][] = [];
  const logger = getLogger({ scopeName: 'CORE' });
  const transport = (logObject: ILogObject) => {
    logs.push(logObject.argumentsArray);
  };
  logger.attachTransport({
    silly: transport,
    debug: transport,
    trace: transport,
    info: transport,
    warn: transport,
    error: transport,
    fatal: transport,
  });
  // Act
  await dataSource.execute({
    statement: 'select $1::INTEGER as test',
    bindParams,
    operations: {} as any,
    profileName: 'mocked-profile',
  });
  // Assert
  expect(logs[0].length).toBe(2);
  expect(logs[0][0]).toBe(`select $1::INTEGER as test`);
  expect(logs[0][1]).toEqual([1234]);
});

it('Should share db instances for same path besides in-memory only db', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'db1',
      type: 'duck',
      connection: {
        'persistent-path': path.resolve(__dirname, 'db1.db'),
      },
      allow: '*',
    },
    {
      name: 'db2',
      type: 'duck',
      connection: {
        'persistent-path': path.resolve(__dirname, 'db1.db'),
      },
      allow: '*',
    },
    {
      name: 'db3',
      type: 'duck',
      connection: {
        'persistent-path': path.resolve(__dirname, 'db2.db'),
      },
      allow: '*',
    },
    {
      name: 'db4',
      type: 'duck',
      connection: {},
      allow: '*',
    },
    {
      name: 'db5',
      type: 'duck',
      connection: {},
      allow: '*',
    },
  ]);
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  await dataSource.execute({
    statement: 'create table if not exists users (id INTEGER);',
    bindParams,
    operations: {} as any,
    profileName: 'db1',
  });
  await dataSource.execute({
    statement: 'create table if not exists users (id INTEGER);',
    bindParams,
    operations: {} as any,
    profileName: 'db4',
  });
  // Act
  const allData: Record<string, any> = {};
  for (const profile of ['db1', 'db2', 'db3', 'db4', 'db5']) {
    const { getData } = await dataSource.execute({
      statement: 'show tables;',
      bindParams,
      operations: {} as any,
      profileName: profile,
    });
    const data = await streamToArray(getData());
    allData[profile] = data;
  }
  // Assert
  expect(allData['db1'].length).toBe(1); // Create table
  expect(allData['db2'].length).toBe(1); // Shared wih db1
  expect(allData['db3'].length).toBe(0); // Do nothing
  expect(allData['db4'].length).toBe(1); // Create table
  expect(allData['db5'].length).toBe(0); // Do nothing
});

it('Should throw error when profile instance not found', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      allow: '*',
    },
  ]);
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  bindParams.set('$1', 0);
  // Act, Assert
  await expect(
    dataSource.execute({
      statement: 'select * from "users" where age < $1',
      bindParams,
      operations: {} as any,
      profileName: 'some-profile',
    })
  ).rejects.toThrow(`Profile instance some-profile not found`);
});

it('Should throw error when exporting data to parquet file but profile instance not found', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      allow: '*',
    },
  ]);
  await dataSource.activate();
  // Act, Assert
  await expect(
    dataSource.export({
      sql: 'some-sql-to-export',
      filepath: 'some-filepath',
      profileName: 'some-profile',
    })
  ).rejects.toThrow(`Profile instance some-profile not found`);
});

it('Should throw error when importing parquet file to create table but profile instance not found', async () => {
  // Arrange
  const dataSource = new DuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      allow: '*',
    },
  ]);
  await dataSource.activate();
  // Act, Assert
  await expect(
    dataSource.import({
      tableName: 'some-table-name',
      filepath: 'some-filepath',
      profileName: 'some-profile',
      schema: 'some-schema',
    })
  ).rejects.toThrow(`Profile instance some-profile not found`);
});

it('Should succeed when exporting data to parquet file', async () => {
  // Arrange
  const dataSource = new MockDuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      connection: {
        'persistent-path': testFile,
      },
      allow: '*',
    },
  ]);
  const filepath = path.resolve(__dirname, 'users.parquet');
  await dataSource.activate();
  // Act
  await dataSource.export({
    sql: 'select * from users',
    filepath,
    profileName: 'mocked-profile',
  });
  // Assert
  const db = dataSource.getInstance('mocked-profile')!;
  await waitForQuery(db);
  await expect(fs.existsSync(filepath)).toBe(true);
  // rm created parquet file
  await fs.promises.rm(filepath, { force: true });
});

it('Should succeed when importing parquet file to create table', async () => {
  // Arrange
  const dataSource = new MockDuckDBDataSource(null, 'duckdb', [
    {
      name: 'mocked-profile',
      type: 'duck',
      connection: {
        'persistent-path': testFile,
      },
      allow: '*',
    },
  ]);
  const filepath = path.resolve(__dirname, 'test-files/nation.parquet');
  await dataSource.activate();
  // Act
  await dataSource.import({
    tableName: 'nation',
    filepath,
    profileName: 'mocked-profile',
    schema: 'mocked_schema',
  });
  // Assert
  const db = dataSource.getInstance('mocked-profile')!;
  const actual = (
    await getQueryResults(db, 'select * from information_schema.tables')
  ).map((row) => {
    return {
      table: row['table_name'],
      schema: row['table_schema'],
    };
  });

  await expect(actual).toContainEqual({
    table: 'nation',
    schema: 'mocked_schema',
  });
});
