import { ICoreOptions } from '@vulcan-sql/core';
import { APIProviderType } from '@vulcan-sql/serve/route';
import { MiddlewareConfig } from './middlewareConfig';

// The serve package config
export interface ServeConfig extends ICoreOptions {
  /** The middleware config options */
  middlewares?: MiddlewareConfig;
  /* The API types would like to build */
  types: Array<APIProviderType>;
}
