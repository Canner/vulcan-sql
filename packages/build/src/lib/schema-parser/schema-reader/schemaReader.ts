export enum SchemaFormat {
  YAML = 'YAML',
}

export interface SchemaData {
  name: string;
  content: string;
  type: SchemaFormat;
}

export abstract class SchemaReader {
  abstract readSchema(): AsyncGenerator<SchemaData>;
}
