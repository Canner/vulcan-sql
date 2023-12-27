import { RedShiftDataSource } from '../src';
import { RedShiftFakeServer } from './redshiftServer';
import { streamToArray } from '@vulcan-sql/api-layer';

let redShift: RedShiftFakeServer;
let dataSource: RedShiftDataSource;

// All tests in this file are skipped, since it costs money in AWS. As of now, we only run tests in the local environment.
it.skip('Preparing the data source', async () => {
  redShift = new RedShiftFakeServer();
});

it.skip('Data source should be activate without any error when all profiles are valid', async () => {
  // Arrange
  dataSource = new RedShiftDataSource({}, '', [redShift.getProfile('profile1')]);

  // Act, Assert
  await expect(dataSource.activate()).resolves.not.toThrow();
});

it.skip('Data source should throw error when activating any profile which is invalid', async () => {
  // Arrange
  const invalidProfile = redShift.getProfile('profile1');
  invalidProfile.connection.credentials.accessKeyId = '';
  invalidProfile.connection.credentials.secretAccessKey = '';
  dataSource = new RedShiftDataSource({}, '', [
    invalidProfile,
  ]);

  // Act, Assert
  await expect(dataSource.activate()).rejects.toThrow();
});

it.skip('Data source should return correct rows with 2 chunks', async () => {
  // Arrange
  dataSource = new RedShiftDataSource({}, '', [redShift.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const sqlStatement = `
    WITH
      input_data as (
        SELECT array(1,2,3,10)  as  id
        union all
        SELECT  array(1)  as id
        union all
        SELECT  array(2,3,4,9)  as id
      )
    SELECT 
      id2 
    FROM 
      input_data AS ids, 
      ids.id AS id2
  `
  const { getData } = await dataSource.execute({
    statement: sqlStatement,
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(9);
}, 30000);

it.skip('Data source should return correct rows with 1 chunk', async () => {
  // Arrange
  dataSource = new RedShiftDataSource({}, '', [redShift.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const sqlStatement = `
    WITH
      input_data as (
        SELECT array(1,2,3,10)  as  id
        union all
        SELECT  array(1)  as id
        union all
        SELECT  array(2,3,4,9)  as id
      ) 
    SELECT 
      id2 
    FROM 
      input_data AS ids, 
      ids.id AS id2
    LIMIT 5
  `
  const { getData } = await dataSource.execute({
    statement: sqlStatement,
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(5);
}, 30000);

it.skip('Data source should return empty data with no row', async () => {
  // Arrange
  dataSource = new RedShiftDataSource({}, '', [redShift.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const sqlStatement = `
    WITH
      input_data as (
        SELECT array(1,2,3,10)  as  id
        union all
        SELECT  array(1)  as id
        union all
        SELECT  array(2,3,4,9)  as id
      ) 
    SELECT 
      id2 
    FROM 
      input_data AS ids, 
      ids.id AS id2
    LIMIT 0
  `
  const { getData } = await dataSource.execute({
    statement: sqlStatement,
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(0);
}, 30000);

it.skip('Data source should work with prepare statements', async () => {
  // Arrange
  dataSource = new RedShiftDataSource({}, '', [redShift.getProfile('profile1')]);
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

it.skip('Data source should return correct column types', async () => {
  // Arrange
  dataSource = new RedShiftDataSource({}, '', [redShift.getProfile('profile1')]);
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
