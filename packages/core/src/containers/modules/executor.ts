import { SQLClauseOperation } from '@vulcan/core/data-query';
import { Pagination } from '../../models/pagination';
import { DataQueryBuilder } from '@vulcan/core/data-query';
import { IDataSource } from '@vulcan/core/data-source';
import { ContainerModule } from 'inversify';
import { Executor } from '../../lib/template-engine/built-in-extensions/query-builder/reqTagRunner';
import { TYPES } from '../types';

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
      statement,
      operations,
      pagination,
    };
  }
}

export const executorModule = () =>
  new ContainerModule((bind) => {
    /**
     * TODO: bind mock data source, need to update after real data source implemented.
     */
    bind<IDataSource>(TYPES.IDataSource).toConstantValue(new MockDataSource());

    bind<Executor>(TYPES.Executor).toDynamicValue((context) => {
      const dataSource = context.container.get<MockDataSource>(
        TYPES.IDataSource
      );
      return {
        createBuilder: async (query: string) =>
          new DataQueryBuilder({ statement: query, dataSource }),
      };
    });
  });
