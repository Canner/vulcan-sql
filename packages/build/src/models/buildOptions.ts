import { ICoreOptions } from '@vulcan-sql/core';
import { ISchemaParserOptions } from './schemaParserOptions';

export interface IBuildOptions extends ICoreOptions {
  'schema-parser'?: ISchemaParserOptions;
}
