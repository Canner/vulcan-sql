export interface ISchemaParserOptions {
  reader: SchemaReaderType;
  folderPath: string;
}

export enum SchemaReaderType {
  LocalFile = 'LocalFile',
}
