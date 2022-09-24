import { FieldInType } from '@vulcan-sql/core';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';

interface Parameter {
  name: string;
  lineNo: number;
  columnNo: number;
}

export class AddParameter extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    // Add fallback value for request property
    schemas.request = schemas.request || [];

    const metadata = schemas.metadata;
    // Skip validation if no metadata found
    if (!metadata?.['parameter.vulcan.com']) return next();

    const parameters: Parameter[] = metadata['parameter.vulcan.com'];
    parameters.forEach((parameter) => {
      // We only check the first value of nested parameters
      const name = parameter.name.split('.')[0];
      if (
        !schemas.request!.some(
          (paramInSchema) => paramInSchema.fieldName === name
        )
      ) {
        schemas.request!.push({
          fieldName: name,
          fieldIn: FieldInType.QUERY,
          validators: [],
        });
      }
    });
    await next();
  }
}
