import { RawAPISchema, SchemaParserMiddleware } from './middleware';

// Use schema sourceName which was generated by schema reader as templateSource when it wan't defined.
// It usually be the path file of schema file.
export class GenerateTemplateSource extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    if (schemas.templateSource) return next();
    schemas.templateSource = schemas.sourceName;
    return next();
  }
}
