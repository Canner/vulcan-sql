import { ICoreOptions } from '@vulcan-sql/core';
import { APIProviderType } from '@vulcan-sql/serve/route';

// The serve package config
export interface ServeConfig extends ICoreOptions {
  /* The API types would like to build */
  ['types']: Array<APIProviderType>;
}

export type AppConfig = Omit<ServeConfig, 'artifact' | 'template' | 'types'>;
