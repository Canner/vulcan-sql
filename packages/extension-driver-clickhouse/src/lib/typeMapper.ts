const typeMapping = new Map<string, string>();

const register = (clickHouseType: string, type: string) => {
  typeMapping.set(clickHouseType, type);
};

// Reference
// https://clickhouse.com/docs/en/native-protocol/columns#integers
// Currently, FieldDataType only support number, string, boolean, Date for generating response schema in the specification.
register('Int', 'number');
register('UInt', 'number');
register('UInt8', 'number');
register('LowCardinality', 'string');
register('UInt16', 'number');
register('UInt32', 'number');
register('UInt64', 'string');
register('UInt128', 'string');
register('UInt256', 'string');
register('Int8', 'number');
register('Int16', 'number');
register('Int32', 'number');
register('Int64', 'string');
register('Int128', 'string');
register('Int256', 'string');
register('Float32', 'number');
register('Float64', 'number');
register('Decimal', 'number');
// When define column type or query result with parameterized query, The Bool or Boolean type both supported.
// But the column type of query result only return Bool, so we only support Bool type for safety.
register('Bool', 'boolean');
register('String', 'string');
register('FixedString', 'string');
register('UUID', 'string');
register('Date32', 'string');
register('Date64', 'string');
register('DateTime32', 'string');
register('DateTime64', 'string');
register('IPv4', 'string');
register('IPv6', 'string');

export const mapFromClickHouseType = (clickHouseType: string) => {
  if (typeMapping.has(clickHouseType)) return typeMapping.get(clickHouseType)!;
  return 'string';
};

/**
 * Convert the JS type (source is JSON format by API query parameter) to the corresponding ClickHouse type for generating named placeholder of parameterized query.
 * Only support to convert number to Int or Float, boolean to Bool, string to String, other types will convert to String.
 * If exist complex type e.g: object, Array, null, undefined, Date, Record.. etc, just convert to string type by ClickHouse function in SQL.
 * ClickHouse support converting string to other types function.
 * Please see Each section of the https://clickhouse.com/docs/en/sql-reference/functions and https://clickhouse.com/docs/en/sql-reference/functions/type-conversion-functions
 * @param value
 * @returns 'FLoat', 'Int', 'Bool', 'String'
 */

export const mapToClickHouseType = (value: any) => {
  if (typeof value === 'number') {
    // infer the float or int according to exist remainder or not
    if (value % 1 !== 0) return 'Float';
    return 'Int';
  }
  // When define column type or query result with parameterized query, The Bool or Boolean type both supported.
  // But the column type of query result only return Bool, so we only support Bool type for safety.
  if (typeof value === 'boolean') return 'Bool';
  if (typeof value === 'string') return 'String';
  return 'String';
};
