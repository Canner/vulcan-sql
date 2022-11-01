const typeMapping = new Map<string, string>();

const register = (bqType: string, type: string) => {
  typeMapping.set(bqType, type);
};

// Reference
// https://github.com/googleapis/nodejs-bigquery/blob/main/src/types.d.ts#L3598-L3601
/**
 * [Required] The field data type. Possible values include
 * STRING,
 * BYTES,
 * INTEGER,
 * INT64 (same as INTEGER),
 * FLOAT,
 * FLOAT64 (same as FLOAT),
 * NUMERIC,
 * BIGNUMERIC,
 * BOOLEAN,
 * BOOL (same as BOOLEAN),
 * TIMESTAMP,
 * DATE,
 * TIME,
 * DATETIME,
 * INTERVAL,
 * RECORD (where RECORD indicates that the field contains a nested schema) or
 * STRUCT (same as RECORD).
 */

register('STRING', 'string');
register('BYTES', 'string');
register('INTEGER', 'number');
register('INT64', 'number');
register('FLOAT', 'number');
register('FLOAT64', 'number');
register('NUMERIC', 'number');
register('BIGNUMERIC', 'number');
register('BOOLEAN', 'boolean');
register('BOOL', 'boolean');
register('TIMESTAMP', 'string');
register('DATE', 'string');
register('TIME', 'string');
register('DATETIME', 'string');
register('INTERVAL', 'string');
register('RECORD', 'string');
register('STRUCT', 'string');

export const mapFromBQTypeId = (bqType: string) => {
  if (typeMapping.has(bqType)) return typeMapping.get(bqType)!;
  return 'string';
};
