import { ICoreOptions } from '@vulcan-sql/core';
import { IDocumentGeneratorOptions } from './documentGeneratorOptions';
import { ISchemaParserOptions } from './schemaParserOptions';

export interface IBuildOptions extends ICoreOptions {
  'schema-parser'?: ISchemaParserOptions;
  'document-generator'?: IDocumentGeneratorOptions;
}
