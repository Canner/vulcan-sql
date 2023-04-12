import { TYPES } from '@vulcan-sql/core/types';
import { AsyncContainerModule, interfaces } from 'inversify';
import { CacheLayerOptions } from '../../options/cacheLayer';
import 'reflect-metadata';
import {
  CacheLayerProvider,
  ICacheLayerOptions,
} from '@vulcan-sql/core/models';

export const cacheLayerModule = (options: ICacheLayerOptions = {}) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<ICacheLayerOptions>(TYPES.CacheLayerInputOptions).toConstantValue(
      options
    );
    bind<ICacheLayerOptions>(TYPES.CacheLayerOptions)
      .to(CacheLayerOptions)
      .inSingletonScope();

    // CacheLayerProvider
    bind<interfaces.AutoNamedFactory<CacheLayerProvider>>(
      TYPES.Factory_CacheLayerProvider
    ).toAutoNamedFactory<CacheLayerProvider>(
      TYPES.Extension_CacheLayerProvider
    );

    if (options?.provider) {
      // data cache provider is an optional component, but we can't use templateEngine.compile() if provider wasn't bound.
      bind<CacheLayerProvider>(TYPES.CacheLayerProvider)
        .toDynamicValue((context) => {
          const factory = context.container.get<
            interfaces.AutoNamedFactory<CacheLayerProvider>
          >(TYPES.Factory_CacheLayerProvider);
          return factory(options.provider!);
        })
        .inSingletonScope();
    }
  });
