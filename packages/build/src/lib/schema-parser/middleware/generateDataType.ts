import { FieldDataType } from '@vulcan/core';
import { SchemaParserMiddleware } from './middleware';

// Fallback to string when type is not defined.
// TODO: Guess the type by validators.
export const generateDataType =
  (): SchemaParserMiddleware => async (schemas, next) => {
    await next();
    (schemas.request || []).forEach((request) => {
      if (!request.type) {
        request.type = FieldDataType.STRING;
      }
    });
  };
