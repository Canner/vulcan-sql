import * as fs from 'fs';
import * as duckdb from 'duckdb';
import * as sinon from 'ts-sinon';
import * as path from 'path';
import {
  CacheLayerInfo,
  CacheLayerLoader,
  CacheLayerOptions,
  DataSource,
  cacheProfileName,
  vulcanCacheSchemaName,
} from '@vulcan-sql/api-layer';
import { MockDataSource, getQueryResults } from './mockDataSource';
const db = new duckdb.Database(':memory:');
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
  it.each([
    {
      templateName: 'template-1',
      cache: {
        cacheTableName: 'employees',
        sql: sinon.default.stub() as any,
        profile: profiles[0].name,
        folderSubpath: '2023',
      } as CacheLayerInfo,
    },
    {
      templateName: 'template-1',
      cache: {
        cacheTableName: 'departments',
        sql: sinon.default.stub() as any,
        profile: profiles[1].name,
        folderSubpath: '2023',
      } as CacheLayerInfo,
    },
  ])(
    'Should use existed parquet to load cache table: $cache.cacheTableName',
    async ({ templateName, cache }) => {
      // Arrange
      const { profile, cacheTableName, folderSubpath } = cache;
      const dir = path.resolve(
        folderPath,
        templateName,
        profile,
        cacheTableName,
        folderSubpath!
      );
      await createParquetFile(dir, cacheTableName);
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
  it(
    'Should remove the other parquet files after executing export',
    async () => {
      // Arrange
      const templateName = 'template-1';
      const cache = {
        cacheTableName: 'employees',
        sql: sinon.default.stub() as any,
        profile: profiles[0].name,
        folderSubpath: '2023',
      } as CacheLayerInfo;
      const { profile, cacheTableName, folderSubpath } = cache;
      const dir = path.resolve(
        folderPath,
        templateName,
        profile,
        cacheTableName,
        folderSubpath!
      );
      const loader = new CacheLayerLoader(options, stubFactory as any);
      await loader.load(templateName, cache);
      expect(fs.readdirSync(dir).length).toBeGreaterThan(0);

      // Act
      cache.folderSubpath = '2024';
      await loader.load(templateName, cache);

      // Assert
      const newDir = path.resolve(
        folderPath,
        templateName,
        profile,
        cacheTableName,
        '2024'!
      );
      expect(fs.readdirSync(dir).length).toEqual(0);
      expect(fs.readdirSync(newDir).length).toBeGreaterThan(0);
    },
    // Set 50s timeout to test cache loader export and load data
    50 * 10000
  );
  it(
    'Should not remove files if parquet files were reused',
    async () => {
      const templateName = 'template-1';
      const cache = {
        cacheTableName: 'employees',
        sql: sinon.default.stub() as any,
        profile: profiles[0].name,
        folderSubpath: '2023',
      } as CacheLayerInfo;
      // Arrange
      const { profile, cacheTableName, folderSubpath } = cache;
      const dir = path.resolve(
        folderPath,
        templateName,
        profile,
        cacheTableName,
        folderSubpath!
      );
      const loader = new CacheLayerLoader(options, stubFactory as any);
      await loader.load(templateName, cache);
      const parquetFiles = fs.readdirSync(dir);

      // Act
      await loader.load(templateName, cache);

      // Assert
      // expect parquetFiles is the same
      expect(fs.readdirSync(dir)).toEqual(parquetFiles);
    },
    // Set 50s timeout to test cache loader export and load data
    50 * 10000
  );

  it(
    'Should remove parquet files of its own folder.',
    async () => {
      // Arrange
      const templateName = 'template-1';
      const cache = {
        cacheTableName: 'employees',
        sql: sinon.default.stub() as any,
        profile: profiles[0].name,
        folderSubpath: '2023',
      } as CacheLayerInfo;
      const { profile, cacheTableName, folderSubpath } = cache;
      const loader = new CacheLayerLoader(options, stubFactory as any);
      await loader.load(templateName, cache);
      const dirPath = path.resolve(
        folderPath,
        templateName,
        profile,
        cacheTableName,
        folderSubpath!
      );
      expect(fs.readdirSync(dirPath).length).toBeGreaterThan(0);

      // Act :load another cache table
      cache.cacheTableName = 'another_employees';
      await loader.load(templateName, cache);

      // Assert
      expect(fs.readdirSync(dirPath).length).toBeGreaterThan(0);
    },
    // Set 50s timeout to test cache loader export and load data
    50 * 10000
  );
});

async function createParquetFile(path: string, fileName: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  db.run(`CREATE OR REPLACE TABLE parquet_table (i integer)`);
  db.run(`INSERT INTO parquet_table (i) VALUES (1)`);
  return new Promise((resolve, reject) => {
    db.run(
      `COPY (SELECT * FROM parquet_table) TO '${path}/${fileName}.parquet' (FORMAT PARQUET);`,
      (err: any) => {
        if (err) reject(err);
        resolve(true);
      }
    );
  });
}
