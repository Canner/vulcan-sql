import { PaginationMode } from '@vulcan-sql/api-layer';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';

// pagination.mode: offset -> OFFSET
export class TransformPaginationMode extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    if (schemas.pagination?.mode)
      schemas.pagination.mode =
        schemas.pagination.mode.toUpperCase() as PaginationMode;
    return next();
  }
}
