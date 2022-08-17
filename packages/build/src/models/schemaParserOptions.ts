export enum SchemaReaderType {
  LocalFile = 'LocalFile',
}

export interface ISchemaParserOptions {
  reader: SchemaReaderType | string;
  folderPath: string;
}
