import { ICoreOptions } from '@vulcan/core';
import { APIProviderType } from '@vulcan/serve/route';
import { MiddlewareConfig } from './middlewareConfig';

// The serve package config
export interface ServeConfig extends ICoreOptions {
  /** The middleware config options */
  middlewares?: MiddlewareConfig;
  /* The API types would like to build */
  types: Array<APIProviderType>;
}
