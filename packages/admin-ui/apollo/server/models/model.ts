export interface CreateModelsInput {
  name: string;
  columns: string[];
}

enum ModelType {
  TABLE = 'TABLE',
  CUSTOM = 'CUSTOM',
}

interface CaculatedFieldData {
  name: string;
  expression: string;
  lineage: number[];
  diagram: JSON;
}

export interface CreateModelData {
  type: ModelType;
  name: string;
  tableName: string;
  refSql: string;
  displayName: string;
  description: string;
  cached: boolean;
  refreshTime?: string;
  fields: [string];
  caculatedFields?: [CaculatedFieldData];
}
