import { TYPES } from '@vulcan-sql/api-layer/types';
import { AsyncContainerModule } from 'inversify';
import { CacheLayerOptions } from '../../options/cacheLayer';
import 'reflect-metadata';
import { ICacheLayerOptions } from '@vulcan-sql/api-layer/models';
import {
  CacheLayerLoader,
  ICacheLayerLoader,
  ICacheLayerRefresher,
  CacheLayerRefresher,
} from '@vulcan-sql/api-layer/cache-layer';

export const cacheLayerModule = (options: ICacheLayerOptions = {}) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<ICacheLayerOptions>(TYPES.CacheLayerInputOptions).toConstantValue(
      options
    );
    bind<ICacheLayerOptions>(TYPES.CacheLayerOptions)
      .to(CacheLayerOptions)
      .inSingletonScope();

    // Cache Layer Loader
    bind<ICacheLayerLoader>(TYPES.CacheLayerLoader)
      .to(CacheLayerLoader)
      .inSingletonScope();

    // Cache Layer Refresher
    bind<ICacheLayerRefresher>(TYPES.CacheLayerRefresher)
      .to(CacheLayerRefresher)
      .inSingletonScope();
  });
