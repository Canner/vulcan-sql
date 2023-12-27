import { FieldInType } from '@vulcan-sql/api-layer';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';

// FieldIn: query => FieldIn FieldInType.QUERY
export class NormalizeFieldIn extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    (schemas.request || []).forEach((request) => {
      if (request.fieldIn) {
        request.fieldIn = request.fieldIn.toUpperCase() as FieldInType;
      }
    });
    return next();
  }
}
