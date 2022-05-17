export enum SchemaFormat {
  YAML = 'YAML',
}

export interface SchemaData {
  name: string;
  content: string;
  type: SchemaFormat;
}

export interface SchemaReader {
  readSchema(): AsyncGenerator<SchemaData>;
}
