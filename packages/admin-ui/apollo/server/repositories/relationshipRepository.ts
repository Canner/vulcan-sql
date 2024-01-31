import { Knex } from 'knex';
import { BaseRepository } from './baseRepository';

export interface Relationship {
  id: number; // ID
  projectId: number; // Reference to project.id
  name: string; // Relation name
  joinType: string; // Join type, eg:"MANY_TO_ONE", "ONE_TO_MANY", "MANY_TO_MANY"
  condition: string; // Join condition, ex: "OrdersModel.custkey = CustomerModel.custkey"
  leftColumnId: number; // Left column id, "{leftSideColumn} {joinType} {rightSideColumn}"
  rightColumnId: number; // Right column id, "{leftSideColumn} {joinType} {rightSideColumn}"
}
export class RelationshipRepository extends BaseRepository<Relationship> {
  constructor(knexPg: Knex) {
    super({ knexPg, tableName: 'relationship' });
  }
}
