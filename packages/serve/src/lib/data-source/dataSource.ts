import { SQLClauseOperation } from '@vulcan/serve/data-query';
import { Pagination } from '@vulcan/serve/route';

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
