import { ClickHouseServer } from './clickHouseServer';
import { ClickHouseDataSource } from '../src';
import { streamToArray } from '@vulcan-sql/api-layer';

let clickHouse: ClickHouseServer;
let dataSource: ClickHouseDataSource;

afterEach(async () => {
  try {
    await clickHouse.destroy();
  } catch {
    // ignore
  }
}, 30000);

it(
  'Data source should throw an error when executing queries on disconnected sources',
  async () => {
    // Arrange
    clickHouse = new ClickHouseServer();
    await clickHouse.prepare();
    dataSource = new ClickHouseDataSource({}, '', [
      clickHouse.getProfile('profile1'),
    ]);
    await dataSource.activate();
    const { getData } = await dataSource.execute({
      statement: 'SELECT 1',
      bindParams: new Map(),
      profileName: 'profile1',
      operations: {} as any,
    });
    // We must consume the stream or the connection won't be released.
    await streamToArray(getData());
    // Close the clickhouse server
    await clickHouse.destroy();

    // Act, Assert
    await expect(
      dataSource.execute({
        statement: 'SELECT 1',
        bindParams: new Map(),
        profileName: 'profile1',
        operations: {} as any,
      })
    ).rejects.toThrow();
  },
  5 * 60 * 1000
);

it(
  'Data source should reconnect when the source was disconnected and reconnected',
  async () => {
    // Arrange
    clickHouse = new ClickHouseServer();
    await clickHouse.prepare();
    dataSource = new ClickHouseDataSource({}, '', [
      clickHouse.getProfile('profile1'),
    ]);
    await dataSource.activate();
    const { getData } = await dataSource.execute({
      statement: 'SELECT 1',
      bindParams: new Map(),
      profileName: 'profile1',
      operations: {} as any,
    });
    // We must consume the stream or the connection won't be released.
    await streamToArray(getData());
    // Close the pg server
    await clickHouse.destroy();
    // Start the pg server again
    await clickHouse.prepare();

    // Act
    const { getData: getSecondData } = await dataSource.execute({
      statement: 'SELECT 1 as a',
      bindParams: new Map(),
      profileName: 'profile1',
      operations: {} as any,
    });
    const data = await streamToArray(getSecondData());

    // Assert
    expect(data).toEqual([{ a: 1 }]);
  },
  5 * 60 * 1000
);
