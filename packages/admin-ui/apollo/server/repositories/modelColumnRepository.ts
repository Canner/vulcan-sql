import { Knex } from 'knex';
import { BaseRepository } from './baseRepository';

export interface ModelColumn {
  id: number; // ID
  modelId: number; // Reference to model ID
  isCalculated: boolean; // Is calculated field
  name: string; // Column name
  aggregation?: string; // Expression for the column, could be custom field or calculated field expression
  lineage?: string; // The selected field in calculated field, array of ids
  diagram?: string; // For FE to store the calculated field diagram
  customExpression?: string; // For custom field or custom expression of calculated field
  type: string; // Data type, refer to the column type in the datasource
  notNull: boolean; // Is not null
  isPk: boolean; // Is primary key of the table
  properties?: string; // Column properties, a json string, the description and displayName should be stored here
}

export class ModelColumnRepository extends BaseRepository<ModelColumn> {
  constructor(knexPg: Knex) {
    super({ knexPg, tableName: 'model_column' });
  }
}
