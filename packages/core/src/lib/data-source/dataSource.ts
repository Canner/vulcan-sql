import { SQLClauseOperation } from '@vulcan-sql/core/data-query';
import { Pagination } from '@vulcan-sql/core/models';
import { Stream } from 'stream';

export type DataColumn = { name: string; type: string };

export type DataResult = {
  getColumns: () => DataColumn[];
  getData: () => Stream;
};
export interface IDataSource {
  execute({
    statement,
    operations,
    pagination,
  }: {
    statement: string;
    operations: SQLClauseOperation;
    pagination?: Pagination;
  }): Promise<DataResult>;
}
