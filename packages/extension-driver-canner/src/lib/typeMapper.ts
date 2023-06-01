import { builtins, TypeId } from 'pg-types';

const typeMapping = new Map<TypeId, string>();

const register = (pgTypeId: TypeId, type: string) => {
  typeMapping.set(pgTypeId, type);
};

// Reference
// https://github.com/brianc/node-pg-types/blob/master/lib/textParsers.js
// https://github.com/brianc/node-pg-types/blob/master/lib/binaryParsers.js

register(builtins.INT8, 'number');
register(builtins.INT4, 'number');
register(builtins.INT2, 'number');
register(builtins.OID, 'number');
register(builtins.NUMERIC, 'number');
register(builtins.FLOAT4, 'number'); // float4/real
register(builtins.FLOAT8, 'number'); // float8/double
register(builtins.BOOL, 'boolean');

export const mapFromPGTypeId = (pgTypeId: number) => {
  if (typeMapping.has(pgTypeId)) return typeMapping.get(pgTypeId)!;
  return 'string';
};
