import { APISchema } from '@vulcan-sql/api-layer';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';

interface ErrorCode {
  code: string;
  lineNo: number;
  columnNo: number;
}

// Add error code to definition if it is used in query but not defined in schema
export class AddMissingErrors extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    await next();
    const transformedSchemas = schemas as APISchema;
    const metadata = schemas.metadata;
    // Skip validation if no metadata found
    if (!metadata?.['error.vulcan.com']) return;

    const errorCodes: ErrorCode[] = metadata['error.vulcan.com'].errorCodes;
    errorCodes.forEach((error) => {
      if (!transformedSchemas.errors.some((e) => e.code === error.code)) {
        transformedSchemas.errors.push({
          code: error.code,
          message: '',
        });
      }
    });
  }
}
