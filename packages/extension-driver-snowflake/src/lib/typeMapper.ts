import * as snowflake from 'snowflake-sdk';

export const mapFromSnowflakeColumnType = (column: snowflake.Column) => {
  if (column.isNumber()) return 'number';
  if (column.isBoolean()) return 'boolean';
  return 'string';
};
