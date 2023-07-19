const typeMapping = new Map<string, string>();

const register = (ksqlType: string, type: string) => {
  typeMapping.set(ksqlType, type);
};

// Reference
// https://docs.ksqldb.io/en/latest/reference/sql/data-types/
register('BOOLEAN', 'boolean');
register('INT', 'number');
register('BIGINT', 'number');
register('DOUBLE', 'number');
register('DECIMAL', 'number');

export const mapFromKsqlDbType = (ksqlType: string) => {
  if (typeMapping.has(ksqlType)) return typeMapping.get(ksqlType)!;
  return 'string';
};
