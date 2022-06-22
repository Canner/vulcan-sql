import { FieldDataType } from '@vulcan/core';
import { SchemaParserMiddleware } from './middleware';

// type: string => FieldIn FieldDataType.STRING
export const normalizeDataType =
  (): SchemaParserMiddleware => async (schemas, next) => {
    (schemas.request || []).forEach((request) => {
      if (request.type) {
        request.type = request.type.toUpperCase() as FieldDataType;
      }
    });
    return next();
  };
