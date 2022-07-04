import {
  DataQueryBuilder,
  IDataQueryBuilder,
} from './builder/dataQueryBuilder';

export const dataQuery = (sqlStatement: string): IDataQueryBuilder => {
  return new DataQueryBuilder({
    statement: sqlStatement,
  });
};
