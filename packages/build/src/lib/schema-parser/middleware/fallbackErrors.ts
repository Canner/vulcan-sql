import { RawAPISchema, SchemaParserMiddleware } from './middleware';

export class FallbackErrors extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    if (schemas.errors) return next();
    schemas.errors = [];
    return next();
  }
}
