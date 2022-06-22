import { ICoreOptions } from '@vulcan/core';
import { ISchemaParserOptions } from './schemaParserOptions';

export interface IBuildOptions extends ICoreOptions {
  name?: string;
  description?: string;
  version?: string;
  schemaParser: ISchemaParserOptions;
}
