import { ICoreOptions } from '@vulcan-sql/api-layer';
import { ISchemaParserOptions } from './schemaParserOptions';

export interface IBuildOptions extends ICoreOptions {
  'schema-parser'?: ISchemaParserOptions;
}
