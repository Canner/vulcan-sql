import { PGServer } from './pgServer';
import { PGDataSource } from '../src';
import { streamToArray } from '@vulcan-sql/core';

let pg: PGServer;
let dataSource: PGDataSource;

afterEach(async () => {
  try {
    if (dataSource) await dataSource.destroy();
  } catch {
    // ignore
  }
  try {
    await pg.destroy();
  } catch {
    // ignore
  }
}, 30000);

it(
  'Data source should throw an error when executing queries on disconnected sources',
  async () => {
    // Arrange
    pg = new PGServer();
    await pg.prepare();
    dataSource = new PGDataSource({}, '', [pg.getProfile('profile1')]);
    await dataSource.activate();
    const { getData } = await dataSource.execute({
      statement: 'SELECT 1',
      bindParams: new Map(),
      profileName: 'profile1',
      operations: {} as any,
    });
    // We must consume the steam or the connection won't be released.
    await streamToArray(getData());
    // Close the pg server
    await pg.destroy();

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
    pg = new PGServer();
    await pg.prepare();
    dataSource = new PGDataSource({}, '', [pg.getProfile('profile1')]);
    await dataSource.activate();
    const { getData } = await dataSource.execute({
      statement: 'SELECT 1',
      bindParams: new Map(),
      profileName: 'profile1',
      operations: {} as any,
    });
    // We must consume the steam or the connection won't be released.
    await streamToArray(getData());
    // Close the pg server
    await pg.destroy();
    // Start the pg server again
    await pg.prepare();

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
