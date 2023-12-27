import { KSqlDbServer } from './ksqlDbServer';
import { streamToArray } from '@vulcan-sql/api-layer';
import { Writable } from 'stream';
import { KSQLDBDataSource } from '../src/lib/ksqldbDataSource';

const ksqldb = new KSqlDbServer();
let dataSource: KSQLDBDataSource;

beforeAll(async () => {
  await ksqldb.prepare();
}, 5 * 60 * 1000); // it might take some time to pull images.

afterAll(async () => {
  await ksqldb.destroy();
}, 2 * 60 * 1000);

it('Data source should be activate without any error when all profiles are valid', async () => {
  // Arrange
  dataSource = new KSQLDBDataSource({}, '', [ksqldb.getProfile('profile1')]);
  // Act, Assert
  await expect(dataSource.activate()).resolves.not.toThrow();
}, 10000);

it('Data source should throw error when activating if any profile is invalid', async () => {
  // Arrange
  dataSource = new KSQLDBDataSource({}, '', [
    ksqldb.getProfile('profile1'),
    {
      name: 'wrong-port',
      type: 'ksqldb',
      connection: {
        host: `http://${ksqldb.host}:1234`,
      },
      allow: '*',
    },
  ]);
  // Act, Assert
  await expect(dataSource.activate()).rejects.toThrow();
}, 10000);

it.each([[103], [2]])(
  'Data source should return correct rows with limit %s',
  async (limit: number) => {
    // Arrange
    dataSource = new KSQLDBDataSource({}, '', [ksqldb.getProfile('profile1')]);
    await dataSource.activate();
    // Act
    const { getData } = await dataSource.execute({
      statement: `SELECT * FROM riderLocations LIMIT ${limit.toString()};`,
      bindParams: new Map(),
      profileName: 'profile1',
      operations: {} as any,
    });
    const rows = await streamToArray(getData());
    // Assert
    expect(rows.length).toBe(limit);
  },
  30000
);

it('Data source should return empty data with no row', async () => {
  // Arrange
  dataSource = new KSQLDBDataSource({}, '', [ksqldb.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'SELECT * FROM riderLocations LIMIT 0;',
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(0);
}, 30000);

it('Data source should query correct result with prepare statements', async () => {
  // Arrange
  dataSource = new KSQLDBDataSource({}, '', [ksqldb.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const bindParams = new Map();
  const param1 = await dataSource.prepare({
    parameterIndex: 1,
    value: '4ab5cbad',
    profileName: 'profile1',
  });
  bindParams.set(param1, '4ab5cbad');

  const { getData } = await dataSource.execute({
    statement: `SELECT * FROM riderLocations WHERE profileId = ${param1};`,
    bindParams,
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(1);
  expect(rows[0]).toEqual({
    Profileid: '4ab5cbad',
    Latitude: 37.3952,
    Longitude: -122.0813,
  });
}, 30000);

it('Data source should return correct column types', async () => {
  // Arrange
  dataSource = new KSQLDBDataSource({}, '', [ksqldb.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getColumns, getData } = await dataSource.execute({
    statement: 'select * from riderLocations limit 0;',
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const column = getColumns();
  // We need to destroy the data stream or the driver waits for us
  const data = getData();
  data.destroy();

  // Assert
  expect(column[0]).toEqual({ name: 'Profileid', type: 'string' });
  expect(column[1]).toEqual({ name: 'Latitude', type: 'number' });
  expect(column[2]).toEqual({ name: 'Longitude', type: 'number' });
}, 30000);

it('Data source should release connection when readable stream is destroyed', async () => {
  // Arrange
  dataSource = new KSQLDBDataSource({}, '', [ksqldb.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'select * from riderLocations limit 100;',
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const readStream = getData();
  const rows: any[] = [];
  let resolve: any;
  const waitForStream = () => new Promise((res) => (resolve = res));
  const writeStream = new Writable({
    write(chunk, _, cb) {
      rows.push(chunk);
      // After read 5 records, destroy the upstream
      if (rows.length === 5) {
        readStream.destroy();
        resolve();
      } else cb();
    },
    objectMode: true,
  });
  readStream.pipe(writeStream);
  await waitForStream();
  // Assert
  expect(rows.length).toBe(5);
  // afterEach hook will timeout if any leak occurred.
}, 30000);
