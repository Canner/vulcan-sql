import { SQLClauseOperation } from '@vulcan/core/data-query';
import { Pagination } from '@vulcan/core/models';

export interface IDataSource {
  execute({
    statement,
    operations,
    pagination,
  }: {
    statement: string;
    operations: SQLClauseOperation;
    pagination?: Pagination;
  }): Promise<object>;
}
