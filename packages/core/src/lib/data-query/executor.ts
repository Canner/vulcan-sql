import { DataSource } from '@vulcan-sql/core';
import { inject, injectable } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import { DataQueryBuilder, IDataQueryBuilder } from './builder';

export interface IExecutor {
  createBuilder(query: string): Promise<IDataQueryBuilder>;
}

@injectable()
export class QueryExecutor implements IExecutor {
  private dataSource: DataSource;
  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.dataSource = dataSource;
  }
  /**
   * create data query builder
   * @param query the sql statement for query
   * @returns
   */
  public async createBuilder(query: string) {
    return new DataQueryBuilder({
      statement: query,
      dataSource: this.dataSource,
    });
  }
}
