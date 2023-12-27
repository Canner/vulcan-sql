import { ExtensionLoader } from '@vulcan-sql/api-layer';
import { AsyncContainerModule } from 'inversify';
import { ServeConfig } from '../../models/serveOptions';
import { BuiltInRouteMiddlewares } from '@vulcan-sql/serve/middleware';
import { BuiltInFormatters } from '@vulcan-sql/serve/response-formatter';
import { BuiltInAuthenticators } from '../../lib/auth';
import { BuiltInDocumentRouters } from '../../lib/document-router';
import { BuiltInCatalogRouters } from '../../lib/catalog-router';

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
    // document router (single module)
    loader.loadInternalExtensionModule(BuiltInDocumentRouters);
    // catalog router (single module)
    loader.loadInternalExtensionModule(BuiltInCatalogRouters);

    loader.bindExtensions(bind);
  });
