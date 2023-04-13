import {
  APISchema,
  CacheLayerInfo,
  cacheProfileName,
  DataResult,
  DataSource,
  dataSourceModule,
  Profile,
  TYPES,
  VulcanExtensionId,
} from '@vulcan-sql/core';
import * as sinon from 'ts-sinon';
import { Container, interfaces, multiInject } from 'inversify';
import {
  CacheLayerStoreLoaderType,
  ICacheLayerOptions,
} from '@vulcan-sql/core';

@VulcanExtensionId('duckdb')
class MockDuckDBDataSource extends DataSource {
  @multiInject(TYPES.Profile) public injectedProfiles!: Profile[];
  public execute(): Promise<DataResult> {
    throw new Error('Method not implemented.');
  }

  public prepare(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}

@VulcanExtensionId('pg')
class MockPGDataSource extends DataSource {
  @multiInject(TYPES.Profile) public injectedProfiles!: Profile[];
  public execute(): Promise<DataResult> {
    throw new Error('Method not implemented.');
  }

  public prepare(): Promise<string> {
    throw new Error('Method not implemented.');
  }
}

it('Cache layer module should bind "cache-layer" profile to "duckdb" type data source when caches setting has least one in some schemas', async () => {
  // Arrange
  const container = new Container();
  container
    .bind(TYPES.Extension_DataSource)
    .to(MockDuckDBDataSource)
    .whenTargetNamed('duckdb');
  container
    .bind(TYPES.Extension_DataSource)
    .to(MockPGDataSource)
    .whenTargetNamed('pg');

  const stubSchemas: Array<APISchema> = [
    {
      ...sinon.stubInterface<APISchema>(),
      cache: [],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      cache: Array(1).fill(sinon.stubInterface<Array<CacheLayerInfo>>()),
    },
  ];
  const stubOptions: ICacheLayerOptions = {
    ...sinon.stubInterface<ICacheLayerOptions>(),
    provider: undefined,
    loader: CacheLayerStoreLoaderType.DuckDB,
  };
  const profiles = new Map<string, Profile>();
  profiles.set('test-pg', { name: 'test-pg', type: 'pg', allow: '*' });
  profiles.set('test-duck', { name: 'test-duck', type: 'duckdb', allow: '*' });
  container.bind(TYPES.ExtensionConfig).toConstantValue({});
  container.bind(TYPES.ExtensionName).toConstantValue('');
  // load executor module & cache layer module
  await container.loadAsync(
    dataSourceModule(profiles, stubSchemas, stubOptions)
  );

  const factory = container.get<interfaces.Factory<any>>(
    TYPES.Factory_DataSource
  );

  // Act
  const dsFromTestPg = factory('test-pg') as MockPGDataSource;
  const dsFromTestDuck = factory('test-duck') as MockDuckDBDataSource;
  const dsFromCacheLayer = factory(cacheProfileName) as MockDuckDBDataSource;

  // Assert
  expect(dsFromTestPg instanceof MockPGDataSource).toBeTruthy();
  expect(dsFromTestDuck instanceof MockDuckDBDataSource).toBeTruthy();
  expect(dsFromCacheLayer instanceof MockDuckDBDataSource).toBeTruthy();

  expect(dsFromTestDuck.injectedProfiles).toEqual([
    { name: 'test-duck', type: 'duckdb', allow: '*' },
    { name: cacheProfileName, type: 'duckdb', allow: '*' },
  ]);
  expect(dsFromCacheLayer.injectedProfiles).toEqual([
    { name: 'test-duck', type: 'duckdb', allow: '*' },
    { name: cacheProfileName, type: 'duckdb', allow: '*' },
  ]);
});
