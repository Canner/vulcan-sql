import { SnowflakeServer } from './snowflakeServer';
import { SnowflakeDataSource } from '../src';
import * as fs from 'fs';
import {
  CacheLayerStoreFormatType,
  ExportOptions,
  streamToArray,
} from '@vulcan-sql/core';

const snow = new SnowflakeServer();
let dataSource: SnowflakeDataSource;

afterEach(async () => {
  try {
    if (dataSource) await dataSource.destroy();
  } catch {
    // ignore
  }
});

it.skip('Data source should be activate without any error when all profiles are valid', async () => {
  // Arrange
  dataSource = new SnowflakeDataSource({}, '', [snow.getProfile('profile1')]);
  // Act, Assert
  await expect(dataSource.activate()).resolves.not.toThrow();
}, 10000);

it.skip('Data source should throw an error when any of profiles is invalid', async () => {
  // Arrange
  const invalidProfile = snow.getProfile('invalid');
  invalidProfile.connection.username = 'invalid';
  invalidProfile.connection.password = '123';
  invalidProfile.connection.acquireTimeoutMillis = 1000; // It's required to set a timeout or the driver will never throw errors.
  dataSource = new SnowflakeDataSource({}, '', [
    snow.getProfile('profile1'),
    invalidProfile,
  ]);
  // Act, Assert
  await expect(dataSource.activate()).rejects.toThrow();
}, 10000);

it.skip('Data source should return correct rows and types', async () => {
  // Arrange
  dataSource = new SnowflakeDataSource({}, '', [snow.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData, getColumns } = await dataSource.execute({
    statement: `select 123 as A, 'str' as B, true as C`,
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  const columns = getColumns();
  // Assert
  expect(rows[0].A).toBe(123);
  expect(rows[0].B).toBe('str');
  expect(rows[0].C).toBe(true);
  expect(columns[0]).toEqual({ name: 'A', type: 'number' });
  expect(columns[1]).toEqual({ name: 'B', type: 'string' });
  expect(columns[2]).toEqual({ name: 'C', type: 'boolean' });
}, 10000);

// should throw internal error if directory is not exist
it.skip('Data source should throw internal error if directory is not exist', async () => {
  // Arrange
  dataSource = new SnowflakeDataSource({}, '', [snow.getProfile('profile1')]);
  await dataSource.activate();
  const directory = `tmp`;
  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
  // Act
  const exportOption: ExportOptions = {
    sql: `SELECT seq4() as seq, uniform(1, 10, RANDOM(12)) as rand
    FROM TABLE(GENERATOR(ROWCOUNT => 100000)) v
    LIMIT 100000`,
    directory,
    profileName: 'profile1',
    type: CacheLayerStoreFormatType.parquet,
  };
  // Assert
  await expect(dataSource.export(exportOption)).rejects.toThrow(
    `Directory tmp not exist`
  );
}, 10000);

// should throw error when error was throw in getCopyToStageSQL, use sinon to stub getCopyToStageSQL
it.skip('Data source should throw error when error was throw in getCopyToStageSQL', async () => {
  // Arrange
  class MockSnowflakeDataSource extends SnowflakeDataSource {
    protected override getCopyToStageSQL(): any {
      throw new Error('mock error');
    }
  }
  const dataSource = new MockSnowflakeDataSource({}, '', [
    snow.getProfile('profile1'),
  ]);
  await dataSource.activate();
  const directory = `tmp`;
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  // Act
  const exportOption: ExportOptions = {
    sql: `SELECT seq4() as seq, uniform(1, 10, RANDOM(12)) as rand
    FROM TABLE(GENERATOR(ROWCOUNT => 100000)) v
    LIMIT 100000`,
    directory,
    profileName: 'profile1',
    type: CacheLayerStoreFormatType.parquet,
  };
  // Assert
  await expect(dataSource.export(exportOption)).rejects.toThrow('mock error');
}, 10000);

it.skip('Data source should export parquet file correctly', async () => {
  // Arrange
  dataSource = new SnowflakeDataSource({}, '', [snow.getProfile('profile1')]);
  await dataSource.activate();
  const directory = `tmp`;
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  // Act
  const rawCount = 10 * 10000;
  const exportOption: ExportOptions = {
    sql: `SELECT seq4() as seq, uniform(1, 10, RANDOM(12)) as rand
    FROM TABLE(GENERATOR(ROWCOUNT => ${rawCount})) v 
    ORDER BY 1`,
    profileName: 'profile1',
    directory,
    type: CacheLayerStoreFormatType.parquet,
  };
  await dataSource.export(exportOption);
  // Assert
  const files = fs.readdirSync(directory);
  expect(files.length).toBe(1);
  expect(files[0]).toMatch(/parquet$/);

  // clean up
  fs.rmSync(directory, { recursive: true, force: true });
}, 15000);

// should export multiple files correctly
it.skip('Data source should export multiple parquet files correctly', async () => {
  // Arrange
  class MockSnowflakeDataSource extends SnowflakeDataSource {
    protected override getCopyToStageSQL(sql: string, stageFilePath: string) {
      // MAX_FILE_SIZE is 2MB
      return `COPY INTO ${stageFilePath} FROM (${sql}) FILE_FORMAT = (TYPE = 'parquet') HEADER=true INCLUDE_QUERY_ID=true MAX_FILE_SIZE=${
        2 * 1024 * 1024
      };`;
    }
  }
  dataSource = new MockSnowflakeDataSource({}, '', [
    snow.getProfile('profile1'),
  ]);
  await dataSource.activate();
  const directory = `tmp`;

  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
  // Act
  const rawCount = 100 * 10000; // 6.6MB
  const exportOption: ExportOptions = {
    sql: `SELECT seq4() as seq, uniform(1, 10, RANDOM(12)) as rand
    FROM TABLE(GENERATOR(ROWCOUNT => ${rawCount})) v
    ORDER BY 1`,
    profileName: 'profile1',
    directory,
    type: CacheLayerStoreFormatType.parquet,
  };
  await dataSource.export(exportOption);
  // Assert
  const files = fs.readdirSync(directory);
  expect(files.length).toBe(4);
  // check each file in the files exists
  files.forEach((file) => {
    expect(file).toMatch(/parquet$/);
  });

  // clean up
  fs.rmSync(directory, { recursive: true, force: true });
}, 30000);

it.skip('Data source should return correct rows with multiple chunks', async () => {
  // Arrange
  dataSource = new SnowflakeDataSource({}, '', [snow.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement:
      'select randstr(1000,random()) from table(generator(rowcount=> 200))',
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(200);
}, 10000);

it.skip('Data source should bind correct parameters', async () => {
  // Arrange
  dataSource = new SnowflakeDataSource({}, '', [snow.getProfile('profile1')]);
  await dataSource.activate();
  const bindParams = new Map<string, any>();
  const expectedValue = 212;
  // Act
  const paramId = await dataSource.prepare({
    parameterIndex: 1,
    value: expectedValue,
    profileName: 'profile1',
  });
  bindParams.set(paramId, expectedValue);
  const { getData } = await dataSource.execute({
    statement: `select ${paramId} as A`,
    bindParams,
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows[0].A).toBe(expectedValue);
}, 10000);

it.skip('Data source should throw an error with invalid syntax', async () => {
  // Arrange
  dataSource = new SnowflakeDataSource({}, '', [snow.getProfile('profile1')]);
  await dataSource.activate();
  // Act, Assert
  await expect(
    dataSource.execute({
      statement: `invalid syntax`,
      bindParams: new Map(),
      profileName: 'profile1',
      operations: {} as any,
    })
  ).rejects.toThrow();
}, 10000);
