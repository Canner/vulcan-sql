import * as fs from 'fs';
import * as sinon from 'ts-sinon';
import {
  CacheLayerInfo,
  CacheLayerLoader,
  CacheLayerOptions,
  DataSource,
  cacheProfileName,
  vulcanCacheSchemaName,
} from '@vulcan-sql/core';
import { MockDataSource, getQueryResults } from './mockDataSource';

describe('Test cache layer loader', () => {
  const folderPath = 'loader-test-exported-parquets';
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

  afterAll(async () => {
    fs.rmSync(folderPath, { recursive: true, force: true });
  });

  it.each([
    {
      templateName: 'template-1',
      cache: {
        cacheTableName: 'employees',
        sql: sinon.default.stub() as any,
        profile: profiles[0].name,
      } as CacheLayerInfo,
    },
    {
      templateName: 'template-1',
      cache: {
        cacheTableName: 'departments',
        sql: sinon.default.stub() as any,
        profile: profiles[1].name,
      } as CacheLayerInfo,
    },
    {
      templateName: 'template-2',
      cache: {
        cacheTableName: 'jobs',
        sql: sinon.default.stub() as any,
        profile: profiles[2].name,
      } as CacheLayerInfo,
    },
  ])(
    'Should export and load $cache.cacheTableName successful when start loader with cache settings for $templateName',
    async ({ templateName, cache }) => {
      // Arrange
      // Act
      const loader = new CacheLayerLoader(options, stubFactory as any);
      await loader.load(templateName, cache);

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
            table: cache.cacheTableName,
            schema: vulcanCacheSchemaName,
          },
        ])
      );
    },
    // Set 50s timeout to test cache loader export and load data
    50 * 10000
  );
});
