import { BindParameters, DataSource } from '@vulcan-sql/core/models';
import { inject, injectable } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import { DataQueryBuilder, IDataQueryBuilder } from './builder';

export interface IExecutor {
  createBuilder(
    query: string,
    bindParams: BindParameters
  ): Promise<IDataQueryBuilder>;
}

@injectable()
export class QueryExecutor implements IExecutor {
  private dataSource: DataSource;
  constructor(@inject(TYPES.DataSource) dataSource: DataSource) {
    this.dataSource = dataSource;
  }
  /**
   * create data query builder
   * @returns
   */
  public async createBuilder(query: string, bindParams: BindParameters) {
    return new DataQueryBuilder({
      statement: query,
      bindParams,
      dataSource: this.dataSource,
    });
  }
}
