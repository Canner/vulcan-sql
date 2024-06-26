import { PGServer } from './pgServer';
import { PGDataSource, PGOptions } from '../src';
import { streamToArray } from '@vulcan-sql/core';
import { Writable } from 'stream';

const pg = new PGServer();
let dataSource: PGDataSource;

beforeAll(async () => {
  await pg.prepare();
}, 5 * 60 * 1000); // it might take some time to pull images.

afterEach(async () => {
  try {
    if (dataSource) await dataSource.destroy();
  } catch {
    // ignore
  }
});

afterAll(async () => {
  await pg.destroy();
}, 30000);

it('Data source should be activate without any error when all profiles are valid', async () => {
  // Arrange
  dataSource = new PGDataSource({}, '', [pg.getProfile('profile1')]);
  // Act, Assert
  await expect(dataSource.activate()).resolves.not.toThrow();
});

it('Data source should throw error when activating if any profile is invalid', async () => {
  // Arrange
  dataSource = new PGDataSource({}, '', [
    pg.getProfile('profile1'),
    {
      name: 'wrong-password',
      type: 'pg',
      connection: {
        host: pg.host,
        user: pg.user,
        password: pg.password + '123',
        database: pg.database,
        port: pg.port,
      } as PGOptions,
      allow: '*',
    },
  ]);
  // Act, Assert
  await expect(dataSource.activate()).rejects.toThrow();
});

it('Data source should return correct rows with 2 chunks', async () => {
  // Arrange
  dataSource = new PGDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'select * from users limit 193',
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
  dataSource = new PGDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'select * from users limit 12',
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
  dataSource = new PGDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'select * from users limit 0',
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(0);
}, 30000);

it('Data source should release the connection when finished no matter success or not', async () => {
  // Arrange
  dataSource = new PGDataSource({}, '', [
    {
      name: 'profile1',
      type: 'pg',
      connection: {
        host: pg.host,
        user: pg.user,
        password: pg.password,
        database: pg.database,
        port: pg.port,
        max: 1, // Limit the pool size to 1, we'll get blocked with any leak.
        min: 1,
      } as PGOptions,
      allow: '*',
    },
  ]);
  await dataSource.activate();

  // Act
  // send parallel queries to test pool leak
  const result = await Promise.all(
    [
      async () => {
        const { getData } = await dataSource.execute({
          statement: 'select * from users limit 1',
          bindParams: new Map(),
          profileName: 'profile1',
          operations: {} as any,
        });
        return await streamToArray(getData());
      },
      async () => {
        try {
          const { getData } = await dataSource.execute({
            statement: 'wrong sql',
            bindParams: new Map(),
            profileName: 'profile1',
            operations: {} as any,
          });
          await streamToArray(getData());
          return [{}]; // fake data
        } catch {
          // ignore error
          return [];
        }
      },
      async () => {
        const { getData } = await dataSource.execute({
          statement: 'select * from users limit 1',
          bindParams: new Map(),
          profileName: 'profile1',
          operations: {} as any,
        });
        return await streamToArray(getData());
      },
    ].map((task) => task())
  );

  // Assert
  expect(result[0].length).toBe(1);
  expect(result[1].length).toBe(0);
  expect(result[2].length).toBe(1);
}, 30000);

it('Data source should work with prepare statements', async () => {
  // Arrange
  dataSource = new PGDataSource({}, '', [pg.getProfile('profile1')]);
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
  dataSource = new PGDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getColumns, getData } = await dataSource.execute({
    statement: 'select * from users limit 0',
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const column = getColumns();
  // We need to destroy the data stream or the driver waits for us
  const data = getData();
  data.destroy();

  // Assert
  expect(column[0]).toEqual({ name: 'id', type: 'number' });
  expect(column[1]).toEqual({ name: 'name', type: 'string' });
  expect(column[2]).toEqual({ name: 'enabled', type: 'boolean' });
}, 30000);

it('Data source should release connection when readable stream is destroyed', async () => {
  // Arrange
  dataSource = new PGDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'select * from users limit 100',
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
