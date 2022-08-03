import { ExtensionLoader } from '@vulcan-sql/core';
import { AsyncContainerModule } from 'inversify';
import { ServeConfig } from '../../models/serveConfig';
import { BuiltInRouteMiddlewares } from '@vulcan-sql/serve/middleware';
import { BuiltInFormatters } from '@vulcan-sql/serve/response-formatter';

export const extensionModule = (options: ServeConfig) =>
  new AsyncContainerModule(async (bind) => {
    const loader = new ExtensionLoader(options);
    // Internal extension modules

    // route middlewares (single module)
    loader.loadInternalExtensionModule(BuiltInRouteMiddlewares);
    // formatter (single module)
    loader.loadInternalExtensionModule(BuiltInFormatters);

    loader.bindExtensions(bind);
  });
