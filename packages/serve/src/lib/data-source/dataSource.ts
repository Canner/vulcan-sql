import { SQLClauseOperation } from '@data-query/.';
import { Pagination } from '@route/.';

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
