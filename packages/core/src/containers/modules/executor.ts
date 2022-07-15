import {
  IExecutor,
  QueryExecutor,
  SQLClauseOperation,
} from '@vulcan-sql/core/data-query';
import { Pagination } from '../../models/pagination';
import { DataResult, IDataSource } from '@vulcan-sql/core/data-source';
import { AsyncContainerModule } from 'inversify';
import { TYPES } from '../types';
import { Stream } from 'stream';

/**
 * TODO: Mock data source to make data query builder could create by IoC
 * need to update after real data source implemented.
 *  */

class MockDataSource implements IDataSource {
  public async execute({
    statement,
    operations,
    pagination,
  }: {
    statement: string;
    operations: SQLClauseOperation;
    pagination?: Pagination | undefined;
  }) {
    return {
      getColumns: () => {
        return [];
      },
      getData: () => {
        return new Stream.Readable();
      },
    } as DataResult;
  }
}

export const executorModule = () =>
  new AsyncContainerModule(async (bind) => {
    /**
     * TODO: bind mock data source, need to update after real data source implemented.
     */
    bind<IDataSource>(TYPES.DataSource).toConstantValue(new MockDataSource());
    bind<IExecutor>(TYPES.Executor).toDynamicValue((context) => {
      const dataSource = context.container.get<IDataSource>(TYPES.DataSource);
      return new QueryExecutor(dataSource);
    });
  });
