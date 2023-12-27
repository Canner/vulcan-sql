import * as fs from 'fs';
import * as sinon from 'ts-sinon';
import {
  APISchema,
  CacheLayerInfo,
  CacheLayerLoader,
  CacheLayerOptions,
  CacheLayerRefresher,
  DataSource,
  ICacheLayerLoader,
  cacheProfileName,
  vulcanCacheSchemaName,
} from '@vulcan-sql/api-layer';
import { MockDataSource, getQueryResults } from './mockDataSource';
import { HttpLogger } from '../../src/lib/loggers/httpLogger';

// This is a helper function that will flush all pending promises in the event loop when use the setInterval and the callback is promise (jest > 27 version).
// reference: https://gist.github.com/apieceofbart/e6dea8d884d29cf88cdb54ef14ddbcc4
const flushPromises = () =>
  new Promise(jest.requireActual('timers').setImmediate);

jest.mock('../../src/lib/loggers/httpLogger', () => {
  const originalModule = jest.requireActual('../../src/lib/loggers/httpLogger');
  return {
    ...originalModule,
    HttpLogger: jest.fn().mockImplementation(() => {
      return {
        isEnabled: jest.fn().mockReturnValue(true),
        log: jest.fn().mockResolvedValue(true), // Spy on the add method
      };
    }),
  };
});
const mockLogger = new HttpLogger(
  {
    enabled: true,
    options: { 'http-logger': { connection: { host: 'localhost' } } },
  },
  'http-logger'
);

describe('Test cache layer refresher', () => {
  const folderPath = 'refresher-test-exported-parquets';
  const profiles = [
    {
      name: 'mock1-profile1',
      type: 'mock',
      allow: '*',
    },
    {
      name: 'mock1-profile2',
      type: 'mock',
      allow: '*',
    },
    {
      name: 'mock2-profile1',
      type: 'mock',
      allow: '*',
    },
    {
      name: cacheProfileName,
      type: 'mock',
      allow: '*',
    },
  ];
  const mockDataSource = new MockDataSource({}, '', profiles);
  const stubFactory = (profileName: string) => {
    const dataSourceMap = {
      [profiles[0].name]: mockDataSource,
      [profiles[1].name]: mockDataSource,
      [profiles[2].name]: mockDataSource,
      [cacheProfileName]: mockDataSource,
    } as Record<string, DataSource>;
    return dataSourceMap[profileName];
  };
  const options = new CacheLayerOptions({
    folderPath,
  });
  let stubCacheLoader: sinon.StubbedInstance<ICacheLayerLoader>;

  beforeAll(async () => {
    stubCacheLoader = sinon.stubInterface<ICacheLayerLoader>();
  });

  afterAll(async () => {
    fs.rmSync(folderPath, { recursive: true, force: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should fail to start when exist duplicate cache table name over than one API schema', async () => {
    // Arrange
    const schemas: Array<APISchema> = [
      {
        ...sinon.stubInterface<APISchema>(),
        templateSource: 'template-1',
        profiles: [profiles[0].name, profiles[1].name],
        cache: [
          {
            cacheTableName: 'orders',
            sql: sinon.default.stub() as any,
            profile: profiles[0].name,
          },
          {
            cacheTableName: 'products',
            sql: sinon.default.stub() as any,
            profile: profiles[1].name,
          },
        ] as Array<CacheLayerInfo>,
      },
      {
        ...sinon.stubInterface<APISchema>(),
        templateSource: 'template-2',
        profiles: [profiles[2].name],
        cache: [
          {
            cacheTableName: 'orders',
            sql: sinon.default.stub() as any,
            profile: profiles[2].name,
          },
        ] as Array<CacheLayerInfo>,
      },
    ];
    const refresher = new CacheLayerRefresher(stubCacheLoader, [mockLogger]);

    // Act, Assert
    await expect(() => refresher.start(schemas)).rejects.toThrow(
      'Not allow to set same cache table name more than one API schema.'
    );
    refresher.stop();
  });

  it('Should fail to start when exist duplicate index name over than one API schema', async () => {
    // Arrange
    const schemas: Array<APISchema> = [
      {
        ...sinon.stubInterface<APISchema>(),
        templateSource: 'template-1',
        profiles: [profiles[0].name, profiles[1].name],
        cache: [
          {
            cacheTableName: 'orders',
            sql: sinon.default.stub() as any,
            profile: profiles[0].name,
            indexes: {
              idx: 'id',
            },
          },
          {
            cacheTableName: 'products',
            sql: sinon.default.stub() as any,
            profile: profiles[1].name,
            indexes: {
              product_idx: 'id',
            },
          },
        ] as Array<CacheLayerInfo>,
      },
      {
        ...sinon.stubInterface<APISchema>(),
        templateSource: 'template-2',
        profiles: [profiles[2].name],
        cache: [
          {
            cacheTableName: 'users',
            sql: sinon.default.stub() as any,
            profile: profiles[2].name,
            indexes: {
              idx: 'id',
            },
          },
        ] as Array<CacheLayerInfo>,
      },
    ];
    const refresher = new CacheLayerRefresher(stubCacheLoader, [mockLogger]);

    // Act, Assert
    await expect(() => refresher.start(schemas)).rejects.toThrow(
      'Not allow to set same index name more than one API schema.'
    );
    refresher.stop();
  });

  it(
    'Should export and load successful when start loader with schemas of non-refresh settings',
    async () => {
      // Arrange
      const schemas: Array<APISchema> = [
        {
          ...sinon.stubInterface<APISchema>(),
          templateSource: 'template-1',
          profiles: [profiles[0].name, profiles[1].name],
          cache: [
            {
              cacheTableName: 'orders',
              sql: sinon.default.stub() as any,
              profile: profiles[0].name,
            },
            {
              cacheTableName: 'products',
              sql: sinon.default.stub() as any,
              profile: profiles[1].name,
            },
          ] as Array<CacheLayerInfo>,
        },
        {
          ...sinon.stubInterface<APISchema>(),
          templateSource: 'template-2',
          profiles: [profiles[2].name],
          cache: [
            {
              cacheTableName: 'users',
              sql: sinon.default.stub() as any,
              profile: profiles[2].name,
            },
          ] as Array<CacheLayerInfo>,
        },
      ];
      // Act
      const loader = new CacheLayerLoader(options, stubFactory as any);
      const refresher = new CacheLayerRefresher(loader, [mockLogger]);
      await refresher.start(schemas);

      // Assert
      const actual = (
        await getQueryResults(
          "select * from information_schema.tables where table_schema = 'vulcan'"
        )
      ).map((row) => {
        return {
          table: row['table_name'],
          schema: row['table_schema'],
        };
      });
      expect(actual).toEqual(
        expect.arrayContaining([
          {
            table: schemas[0].cache[0].cacheTableName,
            schema: vulcanCacheSchemaName,
          },
          {
            table: schemas[0].cache[1].cacheTableName,
            schema: vulcanCacheSchemaName,
          },
          {
            table: schemas[1].cache[0].cacheTableName,
            schema: vulcanCacheSchemaName,
          },
        ])
      );
      refresher.stop();
    },
    // Set 100s timeout to test cache loader export and load data
    100 * 1000
  );

  it('Should export and load correct times when start loader with schemas of refresh time settings', async () => {
    // Arrange
    jest.useFakeTimers();

    const schemas: Array<APISchema> = [
      {
        ...sinon.stubInterface<APISchema>(),
        templateSource: 'template-1',
        profiles: [profiles[0].name, profiles[1].name],
        cache: [
          {
            cacheTableName: 'orders',
            sql: sinon.default.stub() as any,
            profile: profiles[0].name,
            refreshTime: { every: '30s' },
          },
          {
            cacheTableName: 'products',
            sql: sinon.default.stub() as any,
            profile: profiles[1].name,
            refreshTime: { every: '1m' },
          },
        ] as Array<CacheLayerInfo>,
      },
      {
        ...sinon.stubInterface<APISchema>(),
        templateSource: 'template-2',
        profiles: [profiles[2].name],
        cache: [
          {
            cacheTableName: 'users',
            sql: sinon.default.stub() as any,
            profile: profiles[2].name,
          },
        ] as Array<CacheLayerInfo>,
      },
    ];

    // Stub the load method to not do any thing.
    stubCacheLoader.load.resolves();
    const refresher = new CacheLayerRefresher(stubCacheLoader, [mockLogger]);
    // Act
    await refresher.start(schemas);

    // Assert
    const callTimes = (sourceName: string, cache: CacheLayerInfo) =>
      stubCacheLoader.load
        .getCalls()
        .filter((call) => call.calledWith(sourceName.replace('/', '_'), cache))
        .length;

    // called when scheduler start in the beginning
    expect(callTimes(schemas[0].templateSource, schemas[0].cache[0])).toBe(1);
    expect(callTimes(schemas[0].templateSource, schemas[0].cache[1])).toBe(1);
    expect(callTimes(schemas[1].templateSource, schemas[1].cache[0])).toBe(1);

    // after 30s, "schema1_table1" should be called again
    jest.advanceTimersByTime(30 * 1000);
    await flushPromises();
    expect(callTimes(schemas[0].templateSource, schemas[0].cache[0])).toBe(2);
    expect(callTimes(schemas[0].templateSource, schemas[0].cache[1])).toBe(1);
    expect(callTimes(schemas[1].templateSource, schemas[1].cache[0])).toBe(1);

    // after 30s, "schema1_table1" called again and "schema1_table2" called again
    jest.advanceTimersByTime(30 * 1000);
    await flushPromises();
    expect(callTimes(schemas[0].templateSource, schemas[0].cache[0])).toBe(3);
    expect(callTimes(schemas[0].templateSource, schemas[0].cache[1])).toBe(2);
    expect(callTimes(schemas[1].templateSource, schemas[1].cache[0])).toBe(1);

    refresher.stop();
    jest.clearAllTimers();
  });

  it(
    'Should send activity log after cacheLoader execute "load" successfully',
    async () => {
      // Arrange
      const schemas: Array<APISchema> = [
        {
          ...sinon.stubInterface<APISchema>(),
          templateSource: 'template-1',
          profiles: [profiles[0].name, profiles[1].name],
          cache: [
            {
              cacheTableName: 'orders',
              sql: sinon.default.stub() as any,
              profile: profiles[0].name,
            },
            {
              cacheTableName: 'products',
              sql: sinon.default.stub() as any,
              profile: profiles[1].name,
            },
          ] as Array<CacheLayerInfo>,
        },
        {
          ...sinon.stubInterface<APISchema>(),
          templateSource: 'template-2',
          profiles: [profiles[2].name],
          cache: [
            {
              cacheTableName: 'users',
              sql: sinon.default.stub() as any,
              profile: profiles[2].name,
            },
          ] as Array<CacheLayerInfo>,
        },
      ];
      // Act
      const loader = new CacheLayerLoader(options, stubFactory as any);
      const refresher = new CacheLayerRefresher(loader, [mockLogger]);
      await refresher.start(schemas);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledTimes(3);
      refresher.stop();
    },
    100 * 1000
  );
  // Should send activity log when cacheLoader failed on executing "load"
  it(
    'Should send activity log after cacheLoader execute "load" failed',
    async () => {
      const schemas: Array<APISchema> = [
        {
          ...sinon.stubInterface<APISchema>(),
          templateSource: 'template-1',
          profiles: [profiles[0].name, profiles[1].name],
          cache: [
            {
              cacheTableName: 'orders',
              sql: sinon.default.stub() as any,
              profile: profiles[0].name,
            },
            {
              cacheTableName: 'products',
              sql: sinon.default.stub() as any,
              profile: profiles[1].name,
            },
          ] as Array<CacheLayerInfo>,
        },
        {
          ...sinon.stubInterface<APISchema>(),
          templateSource: 'template-2',
          profiles: [profiles[2].name],
          cache: [
            {
              cacheTableName: 'users',
              sql: sinon.default.stub() as any,
              profile: profiles[2].name,
            },
          ] as Array<CacheLayerInfo>,
        },
      ];
      // Act
      const loader = new CacheLayerLoader(options, stubFactory as any);
      stubCacheLoader.load.throws();
      const refresher = new CacheLayerRefresher(loader, [mockLogger]);
      await refresher.start(schemas);

      // Assert
      expect(mockLogger.log).toHaveBeenCalledTimes(3);
      refresher.stop();
    },
    100 * 1000
  );
  // should not send activity log when logger is not enabled
  it('should not send activity log when logger is not enabled', async () => {
    const schemas: Array<APISchema> = [
      {
        ...sinon.stubInterface<APISchema>(),
        templateSource: 'template-1',
        profiles: [profiles[0].name, profiles[1].name],
        cache: [
          {
            cacheTableName: 'orders',
            sql: sinon.default.stub() as any,
            profile: profiles[0].name,
          },
          {
            cacheTableName: 'products',
            sql: sinon.default.stub() as any,
            profile: profiles[1].name,
          },
        ] as Array<CacheLayerInfo>,
      },
      {
        ...sinon.stubInterface<APISchema>(),
        templateSource: 'template-2',
        profiles: [profiles[2].name],
        cache: [
          {
            cacheTableName: 'users',
            sql: sinon.default.stub() as any,
            profile: profiles[2].name,
          },
        ] as Array<CacheLayerInfo>,
      },
    ];
    const mockLogger = new HttpLogger(
      {
        enabled: false,
      },
      'http-logger'
    );
    mockLogger.isEnabled = jest.fn().mockReturnValue(false);
    // Act
    const loader = new CacheLayerLoader(options, stubFactory as any);
    const refresher = new CacheLayerRefresher(loader, [mockLogger]);
    await refresher.start(schemas);

    // Assert
    expect(mockLogger.log).toHaveBeenCalledTimes(0);
    refresher.stop();
  });
});
