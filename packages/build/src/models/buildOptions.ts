import { ICoreOptions } from '@vulcan-sql/core';
import { ISchemaParserOptions } from './schemaParserOptions';

export interface IBuildOptions extends ICoreOptions {
  containerPlatform: string;
  'schema-parser'?: ISchemaParserOptions;
  shouldPull?: boolean;
  isWatchMode?: boolean;
  shouldPrepareVulcanEngine?: boolean;
}
