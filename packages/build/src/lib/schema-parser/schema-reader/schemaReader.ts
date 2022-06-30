export enum SchemaFormat {
  YAML = 'YAML',
}

export interface SchemaData {
  /** The identifier of this schema, we might use this name to mapping SQL sources. */
  sourceName: string;
  content: string;
  type: SchemaFormat;
}

export interface SchemaReader {
  readSchema(): AsyncGenerator<SchemaData>;
}
