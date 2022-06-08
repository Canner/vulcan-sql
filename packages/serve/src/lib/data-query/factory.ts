import { IDataSource } from '@data-source/.';
import {
  DataQueryBuilder,
  IDataQueryBuilder,
} from './builder/dataQueryBuilder';

export const dataQuery = (
  sqlStatement: string,
  dataSource: IDataSource
): IDataQueryBuilder => {
  return new DataQueryBuilder({
    statement: sqlStatement,
    dataSource: dataSource,
  });
};
