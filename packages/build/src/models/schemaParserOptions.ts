export interface ISchemaParserOptions {
  reader: SchemaReaderType;
  schemaPath: string;
}

export enum SchemaReaderType {
  LocalFile = 'LocalFile',
}
