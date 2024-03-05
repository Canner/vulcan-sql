import { Knex } from 'knex';
import {
  BaseRepository,
  IBasicRepository,
  IQueryOptions,
} from './baseRepository';

export interface Relation {
  id: number; // ID
  projectId: number; // Reference to project.id
  name: string; // Relation name
  joinType: string; // Join type, eg:"MANY_TO_ONE", "ONE_TO_MANY", "MANY_TO_MANY"
  condition: string; // Join condition, ex: "OrdersModel.custkey = CustomerModel.custkey"
  fromColumnId: number; // from column id, "{fromColumn} {joinType} {toColumn}"
  toColumnId: number; // to column id, "{fromColumn} {joinType} {toColumn}"
}

export interface IRelationRepository extends IBasicRepository<Relation> {
  findRelationsByColumnIds(
    columnIds: number[],
    queryOptions?: IQueryOptions
  ): Promise<Relation[]>;
  deleteRelationsByColumnIds(
    columnIds: number[],
    queryOptions?: IQueryOptions
  ): Promise<void>;
}

export class RelationRepository extends BaseRepository<Relation> {
  constructor(knexPg: Knex) {
    super({ knexPg, tableName: 'relation' });
  }

  public async findRelationsByColumnIds(
    columnIds: number[],
    queryOptions?: IQueryOptions
  ) {
    let executer = this.knex;
    if (queryOptions && queryOptions.tx) {
      const { tx } = queryOptions;
      executer = tx;
    }
    // select the leftModel name and rightModel name along with relation
    const result = await executer(this.tableName)
      .join(
        'model_column AS fmc',
        `${this.tableName}.from_column_id`,
        '=',
        'fmc.id'
      )
      .join(
        'model_column AS tmc',
        `${this.tableName}.to_column_id`,
        '=',
        'tmc.id'
      )
      .whereIn(`${this.tableName}.from_column_id`, columnIds)
      .orWhereIn(`${this.tableName}.to_column_id`, columnIds)
      .select(
        `${this.tableName}.*`,
        'fmc.model_id AS fromModelId',
        'tmc.model_id AS toModelId'
      );
    return result.map((r) => this.transformFromDBData(r));
  }
  public async deleteRelationsByColumnIds(
    columnIds: number[],
    queryOptions?: IQueryOptions
  ) {
    if (queryOptions && queryOptions.tx) {
      const { tx } = queryOptions;
      await tx(this.tableName)
        .whereIn('from_column_id', columnIds)
        .orWhereIn('to_column_id', columnIds)
        .delete();
      return;
    }
    await this.knex(this.tableName)
      .whereIn('from_column_id', columnIds)
      .orWhereIn('to_column_id', columnIds)
      .delete();
  }
}
