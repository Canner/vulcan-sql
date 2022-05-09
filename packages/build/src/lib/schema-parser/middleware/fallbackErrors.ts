import { SchemaParserMiddleware } from './middleware';

export const fallbackErrors =
  (): SchemaParserMiddleware => async (schemas, next) => {
    if (schemas.errors) return next();
    schemas.errors = [];
    return next();
  };
