import { Parameterized, SQLClauseOperation } from '@vulcan-sql/core';
import { isNull, isUndefined, startCase, lowerCase } from 'lodash';

const isNullOrUndefine = (value: any) => isUndefined(value) || isNull(value);

export const removeEndingSemiColon = (sql: string) => {
  return sql.replace(/;([ \n]+)?$/, '');
};

export const addLimit = (sql: string, limit?: string | null) => {
  if (isNullOrUndefine(limit)) return sql;
  return [sql, `LIMIT`, limit].join(' ');
};

// Check if there is no operations
export const isNoOP = (
  operations: Partial<Parameterized<SQLClauseOperation>>
): boolean => {
  if (!isNullOrUndefine(operations.limit)) return false;
  if (!isNullOrUndefine(operations.offset)) return false;
  return true;
};

export const buildSQL = (
  sql: string,
  operations: Partial<Parameterized<SQLClauseOperation>>
): string => {
  if (isNoOP(operations)) return sql;
  let builtSQL = '';
  // ksqlDB currently does not support subquery
  // OFFSET is not supported, LIMIT syntax is supported >= ksqldb 0.24.0
  // https://github.com/confluentinc/ksql/issues/745
  builtSQL += removeEndingSemiColon(sql);
  builtSQL = addLimit(builtSQL, operations.limit);
  builtSQL += ';';
  return builtSQL;
};

export const convertSchemaToColumns = (schema: string) => {
  // schema example: "`PROFILEID` STRING, `LATITUDE` DOUBLE, `LONGITUDE` DOUBLE"
  return schema
    .replace(/`/g, '')
    .split(', ')
    .map((columnString) => {
      const [name, type] = columnString.split(' ');
      return { name: startCase(lowerCase(name)), type };
    });
};
