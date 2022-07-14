import { FieldInType } from '@vulcan-sql/core';
import { SchemaParserMiddleware } from './middleware';

// FieldIn: query => FieldIn FieldInType.QUERY
export const normalizeFieldIn =
  (): SchemaParserMiddleware => async (schemas, next) => {
    (schemas.request || []).forEach((request) => {
      if (request.fieldIn) {
        request.fieldIn = request.fieldIn.toUpperCase() as FieldInType;
      }
    });
    return next();
  };
