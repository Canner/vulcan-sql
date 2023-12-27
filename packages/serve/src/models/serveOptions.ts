import { ICoreOptions } from '@vulcan-sql/api-layer';
import { APIProviderType } from '@vulcan-sql/serve/route';

export interface sslFileOptions {
  /* key file path */
  key: string;
  /* certificate file path */
  cert: string;
  /** certificate bundle */
  ca: string;
}

// The serve package config
export interface ServeConfig extends ICoreOptions {
  /* http port, if not setup, default is 3000 */
  ['port']?: number;
  /* The API types would like to build */
  ['types']?: Array<APIProviderType>;
  /** When 'enforce-https' is enabled and type is LOCAL in middleware, need the ssl key and cert*/
  ['ssl']?: sslFileOptions;
}
