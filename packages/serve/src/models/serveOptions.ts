import { ICoreOptions } from '@vulcan-sql/core';
import { APIProviderType } from '@vulcan-sql/serve/route';

// The serve package config
export interface ServeConfig extends ICoreOptions {
  /* The API types would like to build */
  ['types']?: Array<APIProviderType>;
  /** When 'enforce-https' is enabled and type is LOCAL in middleware, need the ssl key and cert*/
  ['ssl']?: {
    /* key file path */
    keyFile: string;
    /* certificate file path */
    certFile: string;
  };
}

export type AppConfig = Omit<ServeConfig, 'artifact' | 'template'>;
