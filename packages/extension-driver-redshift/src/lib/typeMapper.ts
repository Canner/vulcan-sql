const typeMapping = new Map<string, string>();

const register = (redshiftType: string, type: string) => {
  typeMapping.set(redshiftType, type);
};

// Reference
// https://docs.aws.amazon.com/redshift/latest/dg/c_Supported_data_types.html
register('smallint', 'number');
register('int2', 'number');
register('integer', 'number');
register('int', 'number');
register('int4', 'number');
register('bigint', 'number');
register('int8', 'number');
register('decimal', 'number');
register('numeric', 'number');
register('real', 'number');
register('float4', 'number');
register('doubleprecision', 'number');
register('float8', 'number');
register('float', 'number');
register('boolean', 'boolean');
register('bool', 'boolean');
register('char', 'string');
register('character', 'string');
register('nchar', 'string');
register('bpchar', 'string');
register('varchar', 'string');
register('charactervarying', 'string');
register('nvarchar', 'string');
register('text', 'string');
register('date', 'string');
register('timestamp', 'string');
register('super', 'string');

export const mapFromRedShiftTypeId = (redshiftType: string) => {
  if (typeMapping.has(redshiftType)) return typeMapping.get(redshiftType)!;
  return 'string';
};
