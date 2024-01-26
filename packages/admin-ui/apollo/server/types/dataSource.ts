export enum DataSourceName {
  BIG_QUERY = 'BIG_QUERY',
}

interface BaseDataSource {
  type: DataSourceName;
}

export interface UsableDataSource extends BaseDataSource {
  requiredProperties: string[];
}

export interface DataSource extends BaseDataSource {
  properties: any;
}

export interface CompactColumn {
  name: string;
  tableName: string;
}

enum ModelType {
  TABLE = 'TABLE',
  CUSTOM = 'CUSTOM',
}

export interface CreateModelPayload {
  type: ModelType;
  tableName: string;
  fields?: string[];
  customFields?: {
    name: string;
    expression: string;
  }[];
  calculatedFields?: {
    name: string;
    expression: string;
  }[];
}
