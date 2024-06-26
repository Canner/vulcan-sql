import { BQDataSource } from '../src';
import { BQflakeServer } from './bqServer';
import { ExportOptions, streamToArray } from '@vulcan-sql/core';
import * as fs from 'fs';

const bigQuery = new BQflakeServer();
let dataSource: BQDataSource;

const tmpDir = 'tmp';
afterEach(async () => {
  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

it('Data source should be activate without any error when all profiles are valid', async () => {
  // Arrange
  dataSource = new BQDataSource({}, '', [bigQuery.getProfile('profile1')]);

  // Act, Assert
  await expect(dataSource.activate()).resolves.not.toThrow();
});

it('Data source should throw error when activating any profile which is invalid', async () => {
  // Arrange
  const invalidProfile = bigQuery.getProfile('profile1');
  invalidProfile.connection.credentials = {};
  dataSource = new BQDataSource({}, '', [
    bigQuery.getProfile('profile1'),
    invalidProfile,
  ]);

  // Act, Assert
  await expect(dataSource.activate()).rejects.toThrow();
});

it('Data source should return correct rows with 2 chunks', async () => {
  // Arrange
  dataSource = new BQDataSource({}, '', [bigQuery.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: `SELECT num FROM UNNEST(GENERATE_ARRAY(1, 193)) AS num`,
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(193);
}, 30000);

it('Data source should return correct rows with 1 chunk', async () => {
  // Arrange
  dataSource = new BQDataSource({}, '', [bigQuery.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: `SELECT num FROM UNNEST(GENERATE_ARRAY(1, 20)) AS num LIMIT 12`,
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(12);
}, 30000);

it('Data source should return empty data with no row', async () => {
  // Arrange
  dataSource = new BQDataSource({}, '', [bigQuery.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: `SELECT num FROM UNNEST(GENERATE_ARRAY(1, 10)) AS num LIMIT 0`,
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(0);
}, 30000);

it('Data source should work with prepare statements', async () => {
  // Arrange
  dataSource = new BQDataSource({}, '', [bigQuery.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const bindParams = new Map();
  const var1Name = await dataSource.prepare({
    parameterIndex: 1,
    value: '123',
    profileName: 'profile1',
  });
  bindParams.set(var1Name, '123');

  const var2Name = await dataSource.prepare({
    parameterIndex: 2,
    value: '456',
    profileName: 'profile1',
  });
  bindParams.set(var2Name, '456');

  const { getData } = await dataSource.execute({
    statement: `select ${var1Name} as v1, ${var2Name} as v2;`,
    bindParams,
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows[0].v1).toBe('123');
  expect(rows[0].v2).toBe('456');
}, 30000);

it('Data source should return correct column types', async () => {
  // Arrange
  dataSource = new BQDataSource({}, '', [bigQuery.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getColumns, getData } = await dataSource.execute({
    statement: `SELECT CAST(1 as bigint) as a, true as b`,
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const column = getColumns();
  // We need to destroy the data stream or the driver waits for us
  const data = getData();
  data.destroy();

  // Assert
  expect(column[0]).toEqual({ name: 'a', type: 'number' });
  expect(column[1]).toEqual({ name: 'b', type: 'boolean' });
}, 30000);

it('Data source should export data successfully if profile is valid', async () => {
  // Arrange
  dataSource = new BQDataSource({}, '', [bigQuery.getProfile('profile1')]);
  await dataSource.activate();
  // Act, Assert
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  await expect(
    dataSource.export({
      sql: `SELECT num FROM UNNEST(GENERATE_ARRAY(1, 5)) AS num`,
      directory: 'tmp',
      profileName: 'profile1',
    } as ExportOptions)
  ).resolves.not.toThrow();
  const files = fs.readdirSync(tmpDir);
  expect(files.length).toBe(1);
  files.forEach((file) => {
    expect(file).toMatch(/.parquet$/);
  });
}, 50000);

it('Data source should throw error if not directory', async () => {
  // Arrange
  dataSource = new BQDataSource({}, '', [bigQuery.getProfile('profile1')]);
  await dataSource.activate();
  // Act, Assert
  await expect(
    dataSource.export({
      sql: `SOME STATEMENT`,
      directory: 'dir_not_exist',
      profileName: 'profile1',
    } as ExportOptions)
  ).rejects.toThrow('Directory "dir_not_exist" does not exist');
}, 50000);

it('Data source should throw error if bucketName is not provided', async () => {
  // Arrange
  const profile = bigQuery.getProfile('profile1');
  profile.cache.bucketName = '';
  dataSource = new BQDataSource({}, '', [profile]);
  await dataSource.activate();
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  // Act, Assert
  await expect(
    dataSource.export({
      sql: `SOME STATEMENT`,
      directory: 'tmp',
      profileName: 'profile1',
    } as ExportOptions)
  ).rejects.toThrow(
    'cache.bucketName in profile "profile1" is required when using cache feature.'
  );
}, 50000);
