import {
  CacheLayerProviderType,
  CacheLayerStoreLoaderType,
  ICacheLayerOptions,
} from '@vulcan-sql/core/models';
import { CacheLayerOptions } from '@vulcan-sql/core/options';
import { TYPES } from '@vulcan-sql/core/types';
import { Container } from 'inversify';

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind(TYPES.CacheLayerOptions)
    .to(CacheLayerOptions)
    .inSingletonScope();
});

it('Should provide correct default option values', async () => {
  // Action
  const options = container.get<CacheLayerOptions>(TYPES.CacheLayerOptions);
  // Assert
  expect(options.provider).toBe(CacheLayerProviderType.LocalFile);
  expect(options.loader).toBe(CacheLayerStoreLoaderType.DuckDB);
});

it('Can override some option properties', async () => {
  // Arrange
  container
    .bind<Partial<ICacheLayerOptions>>(TYPES.CacheLayerInputOptions)
    .toConstantValue({
      folderPath: '/cache',
    });
  const options = container.get<CacheLayerOptions>(TYPES.CacheLayerOptions);
  // Assert
  expect(options.provider).toBe(CacheLayerProviderType.LocalFile);
  expect(options.loader).toBe(CacheLayerStoreLoaderType.DuckDB);
  expect(options.folderPath).toBe('/cache');
});

it('Schema validation should work', async () => {
  // Arrange
  container.bind(TYPES.CacheLayerInputOptions).toConstantValue({
    provider: null,
  });
  // Act. Assert
  expect(() =>
    container.get<CacheLayerOptions>(TYPES.CacheLayerOptions)
  ).not.toThrow();
});
