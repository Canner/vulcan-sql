import { SchemaParserMiddleware } from './middleware';

export const generateTemplateSource =
  (): SchemaParserMiddleware => async (schemas, next) => {
    if (schemas.templateSource) return next();
    schemas.templateSource = schemas.sourceName;
    return next();
  };
