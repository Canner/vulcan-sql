import { ClickHouseServer } from './clickHouseServer';
import { ClickHouseDataSource, ClickHouseOptions } from '../src';
import { streamToArray } from '@vulcan-sql/core';
import { Writable } from 'stream';

const clickHouse = new ClickHouseServer();
let dataSource: ClickHouseDataSource;

beforeAll(async () => {
  await clickHouse.prepare();
}, 5 * 60 * 1000); // it might take some time to pull images.

afterAll(async () => {
  await clickHouse.destroy();
}, 30000);

it('Data source should be activate without any error when all profiles are valid', async () => {
  // Arrange
  dataSource = new ClickHouseDataSource({}, '', [
    clickHouse.getProfile('profile1'),
  ]);
  // Act, Assert
  await expect(dataSource.activate()).resolves.not.toThrow();
}, 10000);

it('Data source should throw error when activating if any profile is invalid', async () => {
  // Arrange
  dataSource = new ClickHouseDataSource({}, '', [
    clickHouse.getProfile('profile1'),
    {
      name: 'wrong-password',
      type: 'clickhouse',
      connection: {
        host: `http://${clickHouse.host}:${clickHouse.port}`,
        user: clickHouse.user,
        password: clickHouse.password + 'wrong',
        database: clickHouse.database,
      } as ClickHouseOptions,
      allow: '*',
    },
  ]);
  // Act, Assert
  await expect(dataSource.activate()).rejects.toThrow();
}, 10000);

it.each([[193], [2]])(
  'Data source should return correct rows with limit %s',
  async (limit: number) => {
    // Arrange
    dataSource = new ClickHouseDataSource({}, '', [
      clickHouse.getProfile('profile1'),
    ]);
    await dataSource.activate();
    // Act
    const { getData } = await dataSource.execute({
      statement: `SELECT * FROM products LIMIT ${limit.toString()}`,
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
  dataSource = new ClickHouseDataSource({}, '', [
    clickHouse.getProfile('profile1'),
  ]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'SELECT * FROM products LIMIT 0',
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(0);
}, 30000);

it('Data source should return correct data with rows', async () => {
  // Arrange
  dataSource = new ClickHouseDataSource({}, '', [
    clickHouse.getProfile('profile1'),
  ]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'SELECT * FROM products ORDER BY serial ASC LIMIT 2',
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toEqual(2);
  expect(rows[0]).toEqual({
    serial: 1,
    product_id: '6fd1080f-c186-42ba-b32c-10211a8689a2',
    name: 'juice',
    price: 30,
    enabled: true,
  });
  expect(rows[1]).toEqual({
    serial: 2,
    product_id: '17a677ca-8f50-49c5-82d7-bce85031ee09',
    name: 'egg',
    price: 50,
    enabled: false,
  });
}, 30000);

it('Data source should work with prepare statements', async () => {
  // Arrange
  dataSource = new ClickHouseDataSource({}, '', [
    clickHouse.getProfile('profile1'),
  ]);
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
    statement: `SELECT ${var1Name} AS v1, ${var2Name} AS v2;`,
    bindParams,
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows[0].v1).toBe('123');
  expect(rows[0].v2).toBe('456');
}, 30000);

it('Data source should query correct result with prepare statements', async () => {
  // Arrange
  dataSource = new ClickHouseDataSource({}, '', [
    clickHouse.getProfile('profile1'),
  ]);
  await dataSource.activate();
  // Act
  const bindParams = new Map();
  const param1 = await dataSource.prepare({
    parameterIndex: 1,
    value: 'juice',
    profileName: 'profile1',
  });
  bindParams.set(param1, 'juice');

  const param2 = await dataSource.prepare({
    parameterIndex: 2,
    value: 30,
    profileName: 'profile1',
  });
  bindParams.set(param2, 30);

  const { getData } = await dataSource.execute({
    statement: `SELECT * FROM products WHERE name = ${param1} AND price = ${param2} ORDER BY serial ASC;`,
    bindParams,
    profileName: 'profile1',
    operations: {} as any,
  });
  const rows = await streamToArray(getData());
  // Assert
  expect(rows.length).toBe(1);
  expect(rows[0]).toEqual({
    serial: 1,
    product_id: '6fd1080f-c186-42ba-b32c-10211a8689a2',
    name: 'juice',
    price: 30,
    enabled: true,
  });
}, 30000);

it('Data source should return correct column types', async () => {
  // Arrange
  dataSource = new ClickHouseDataSource({}, '', [
    clickHouse.getProfile('profile1'),
  ]);
  await dataSource.activate();
  // Act
  const { getColumns, getData } = await dataSource.execute({
    statement: 'select * from products limit 0',
    bindParams: new Map(),
    profileName: 'profile1',
    operations: {} as any,
  });
  const column = getColumns();
  // We need to destroy the data stream or the driver waits for us
  const data = getData();
  data.destroy();

  // Assert
  expect(column[0]).toEqual({ name: 'serial', type: 'number' });
  expect(column[1]).toEqual({ name: 'product_id', type: 'string' });
  expect(column[2]).toEqual({ name: 'name', type: 'string' });
  expect(column[3]).toEqual({ name: 'price', type: 'number' });
  expect(column[4]).toEqual({ name: 'enabled', type: 'boolean' });
}, 30000);

it('Data source should release connection when readable stream is destroyed', async () => {
  // Arrange
  dataSource = new ClickHouseDataSource({}, '', [
    clickHouse.getProfile('profile1'),
  ]);
  await dataSource.activate();
  // Act
  const { getData } = await dataSource.execute({
    statement: 'select * from products limit 100',
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

it('Data source should release the connection when finished no matter success or not', async () => {
  // Arrange
  dataSource = new ClickHouseDataSource({}, '', [
    {
      name: 'profile1',
      type: 'clickhouse',
      connection: {
        host: `http://${clickHouse.host}:${clickHouse.port}`,
        username: clickHouse.user,
        password: clickHouse.password,
        database: clickHouse.database,
        // Limit the max connection size to 1, we'll get blocked with any leak.
        max_open_connections: 1,
      } as ClickHouseOptions,
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
          statement: 'select * from products limit 1',
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
          statement: 'select * from products limit 1',
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
