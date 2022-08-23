import { ExtensionLoader } from '@vulcan-sql/core';
import { AsyncContainerModule } from 'inversify';
import { ServeConfig } from '../../models/serveOptions';
import { BuiltInRouteMiddlewares } from '@vulcan-sql/serve/middleware';
import { BuiltInFormatters } from '@vulcan-sql/serve/response-formatter';
import { BuiltInAuthenticators } from '../../lib/auth';
import { BuiltInDocumentServers } from '../../lib/document-server';

export const extensionModule = (options: ServeConfig) =>
  new AsyncContainerModule(async (bind) => {
    const loader = new ExtensionLoader(options);
    // Internal extension modules

    // route middlewares (single module)
    loader.loadInternalExtensionModule(BuiltInRouteMiddlewares);
    // formatter (single module)
    loader.loadInternalExtensionModule(BuiltInFormatters);
    // authenticator (single module)
    loader.loadInternalExtensionModule(BuiltInAuthenticators);
    // document server (single module)
    loader.loadInternalExtensionModule(BuiltInDocumentServers);

    loader.bindExtensions(bind);
  });
