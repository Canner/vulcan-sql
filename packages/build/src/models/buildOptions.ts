import { ICoreOptions } from '@vulcan/core';
import { ISchemaParserOptions } from './schemaParserOptions';

export interface IBuildOptions extends ICoreOptions {
  schemaParser: ISchemaParserOptions;
}
