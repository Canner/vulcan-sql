import { ICoreOptions } from '@vulcan-sql/core';
import { ISchemaParserOptions } from './schemaParserOptions';

export interface IBuildOptions extends ICoreOptions {
  name?: string;
  description?: string;
  version?: string;
  schemaParser: ISchemaParserOptions;
}
