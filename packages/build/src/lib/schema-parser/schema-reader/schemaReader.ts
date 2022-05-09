export enum SchemaDataType {
  YAML = 'YAML',
}

export interface SchemaData {
  name: string;
  content: string;
  type: SchemaDataType;
}

export abstract class SchemaReader {
  abstract readSchema(): AsyncGenerator<SchemaData>;
}
