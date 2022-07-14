import { TYPES } from '@vulcan-sql/core';
import { inject, injectable } from 'inversify';
import { DataQueryBuilder, IDataQueryBuilder } from './builder';
import { IDataSource } from '../data-source';

export interface IExecutor {
  createBuilder(query: string): Promise<IDataQueryBuilder>;
}

export class QueryExecutor implements IExecutor {
  private dataSource: IDataSource;
  constructor(dataSource: IDataSource) {
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
