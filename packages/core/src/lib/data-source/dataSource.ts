import { SQLClauseOperation } from '@vulcan-sql/core/data-query';
import { Pagination } from '@vulcan-sql/core/models';

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
