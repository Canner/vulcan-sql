export interface CreateModelsInput {
  name: string;
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
  displayName: string;
  sourceTableName: string;
  refSql: string;
  description: string;
  cached: boolean;
  refreshTime?: string;
  fields: [string];
  caculatedFields?: [CaculatedFieldData];
}
