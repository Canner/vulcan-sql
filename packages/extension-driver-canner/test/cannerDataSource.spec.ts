import { CannerServer } from './cannerServer';
import { CannerDataSource, PGOptions } from '../src';
import { MockCannerDataSource } from './mock';
import { ExportOptions, InternalError, streamToArray } from '@vulcan-sql/core';
import { Writable } from 'stream';
import * as sinon from 'ts-sinon';
import * as fs from 'fs';
import { CannerAdapter } from '../src/lib/cannerAdapter';

const pg = new CannerServer();
let dataSource: CannerDataSource;
let mockDataSource: MockCannerDataSource;

const directory = 'tmp_test_canner';
// restore all sinon mock/stub before each test
beforeEach(() => {
  sinon.default.restore();
});

it('Data source should be activate without any error when all profiles are valid', async () => {
  // Arrange
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  // Act, Assert
  await expect(dataSource.activate()).resolves.not.toThrow();
});

it('Data source should throw error when activating if any profile is invalid', async () => {
  // Arrange
  const profile1 = pg.getProfile('profile1');
  dataSource = new CannerDataSource({}, '', [
    profile1,
    {
      name: 'wrong-password',
      type: 'canner',
      connection: {
        ...profile1.connection,
        password: 'wrong-password',
      } as PGOptions,
      allow: '*',
    },
  ]);
  // Act, Assert
  await expect(dataSource.activate()).rejects.toThrow();
});

// export method should be executed successfully
it('Data source should export successfully', async () => {
  fs.mkdirSync(directory, { recursive: true });
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();

  // Act, Assert
  await expect(
    dataSource.export({
      sql: 'select 1',
      directory,
      profileName: 'profile1',
    } as ExportOptions)
  ).resolves.not.toThrow();
  expect(fs.readdirSync(directory).length).toBe(1);

  // clean up
  fs.rmSync(directory, { recursive: true, force: true });
}, 100000);

it('Data source should throw error when fail to export data', async () => {
  // Arrange
  // TODO: refactor to avoid stubbing private method
  // stub the private function to manipulate getting error from the remote server
  sinon.default
    .stub(CannerAdapter.prototype, 'createAsyncQueryResultUrls')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .callsFake(async (sql) => {
      throw new InternalError(
        'Failed to get workspace request "mock/url" data'
      );
    });

  fs.mkdirSync(directory, { recursive: true });
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();

  // Act, Assert
  await expect(
    dataSource.export({
      sql: 'select 1',
      directory,
      profileName: 'profile1',
    } as ExportOptions)
  ).rejects.toThrow();
  expect(fs.readdirSync(directory).length).toBe(0);

  // clean up
  fs.rmSync(directory, { recursive: true, force: true });
}, 100000);

it('Data source should throw error when given directory is not exist', async () => {
  // Arrange
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();

  // Act, Assert
  await expect(
    dataSource.export({
      sql: 'select 1',
      directory: directory,
      profileName: 'profile1',
    } as ExportOptions)
  ).rejects.toThrow();
}, 100000);

it('Data source should throw error when given profile name is not exist', async () => {
  // Arrange
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  fs.mkdirSync(directory, { recursive: true });

  // Act, Assert
  await expect(
    dataSource.export({
      sql: 'select 1',
      directory,
      profileName: 'profile not exist',
    } as ExportOptions)
  ).rejects.toThrow();
}, 100000);

it('Data source should return correct rows with 1 chunks', async () => {
  // Arrange
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: "select 123 as A, 'str' as B, true as C",
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(1);
}, 30000);

it('Data source should return correct rows', async () => {
  // Arrange
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: "select 123 as A, 'str' as B, true as C",
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(1);
}, 30000);

it('Data source should return empty data with no row', async () => {
  // Arrange
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'select 1  limit 0',
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
  const profile1 = pg.getProfile('profile1');
  dataSource = new CannerDataSource({}, '', [
    {
      name: 'profile1',
      type: 'canner',
      connection: {
        ...profile1.connection,
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
          statement: 'select 1',
          bindParams: new Map(),
          profileName: 'profile1',
          operations: {} as any,
        });
        return await streamToArray(getData());
      },
      async () => {
        try {
          const { getData } = await dataSource.execute({
            statement: 'select 1',
            bindParams: new Map(),
            profileName: 'profile1',
            operations: {} as any,
          });
          await streamToArray(getData());
          return [{}]; // fake data
        } catch (error) {
          // ignore error
          return [];
        }
      },
      async () => {
        const { getData } = await dataSource.execute({
          statement: 'select 1',
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
  expect(result[1].length).toBe(1);
  expect(result[2].length).toBe(1);
}, 60000);

it('Data source should work with prepare statements', async () => {
  // Arrange
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
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
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getColumns, getData } = await dataSource.execute({
    statement: "select 1 as id, 'name' as name, true as enabled limit 0",
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
  dataSource = new CannerDataSource({}, '', [pg.getProfile('profile1')]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'select 1',
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
      // After read 1 records, destroy the upstream
      if (rows.length === 1) {
        readStream.destroy();
        resolve();
      } else cb();
    },
    objectMode: true,
  });
  readStream.pipe(writeStream);
  await waitForStream();
  // Assert
  expect(rows.length).toBe(1);
  // afterEach hook will timeout if any leak occurred.
}, 300000);

it('Should return the same pool when the profile is the same', async () => {
  // Arrange
  mockDataSource = new MockCannerDataSource({}, '', [
    pg.getProfile('profile1'),
  ]);
  await mockDataSource.activate();
  // Act
  const pool1 = mockDataSource.getPool('profile1');
  const pool2 = mockDataSource.getPool('profile1');
  // Assert
  expect(pool1 === pool2).toBeTruthy();
}, 30000);

it('Should return the same pool when the profile and authentication is the same', async () => {
  // Arrange
  mockDataSource = new MockCannerDataSource({}, '', [
    pg.getProfile('profile1'),
  ]);
  await mockDataSource.activate();
  // Act
  const pool1 = mockDataSource.getPool('profile1', 'the-same-authentication');
  const pool2 = mockDataSource.getPool('profile1', 'the-same-authentication');
  // Assert
  expect(pool1 === pool2).toBeTruthy();
}, 30000);

it('Should return different pool if authentication exist in headers even the profile is the same', async () => {
  // Arrange
  mockDataSource = new MockCannerDataSource({}, '', [
    pg.getProfile('profile1'),
  ]);
  await mockDataSource.activate();
  // Act
  const pool1 = mockDataSource.getPool('profile1');
  const pool2 = mockDataSource.getPool('profile1', 'my-authentication');
  // Assert
  expect(pool1 == pool2).toBeFalsy();
}, 30000);

it('Should return different pool with different authentication even the profile is the same', async () => {
  // Arrange
  mockDataSource = new MockCannerDataSource({}, '', [
    pg.getProfile('profile1'),
  ]);
  await mockDataSource.activate();
  // Act
  const pool1 = mockDataSource.getPool('profile1', 'authentication');
  const pool2 = mockDataSource.getPool('profile1', 'differ-authentication');
  // Assert
  expect(pool1 === pool2).toBeFalsy();
}, 30000);
