import { SnowflakeServer } from './snowflakeServer';
import { SnowflakeDataSource } from '../src';
import { streamToArray } from '@vulcan-sql/core';

const snow = new SnowflakeServer();
let dataSource: SnowflakeDataSource;

afterEach(async () => {
  try {
    if (dataSource) await dataSource.destroy();
  } catch {
    // ignore
  }
});

it('Data source should be activate without any error when all profiles are valid', async () => {
  // Arrange
  dataSource = new SnowflakeDataSource({}, '', [snow.getProfile('profile1')]);
  // Act, Assert
  await expect(dataSource.activate()).resolves.not.toThrow();
});

it('Data source should throw an error when any of profiles is invalid', async () => {
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

it('Data source should return correct rows and types', async () => {
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

it('Data source should return correct rows with multiple chunks', async () => {
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

it('Data source should bind correct parameters', async () => {
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

it('Data source should throw an error with invalid syntax', async () => {
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
