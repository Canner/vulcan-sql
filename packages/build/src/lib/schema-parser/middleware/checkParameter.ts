import { AllTemplateMetadata, APISchema } from '@vulcan-sql/core';
import { SchemaParserMiddleware } from './middleware';

interface Parameter {
  name: string;
  lineNo: number;
  columnNo: number;
}

export const checkParameter =
  (allMetadata: AllTemplateMetadata): SchemaParserMiddleware =>
  async (schemas, next) => {
    await next();
    const transformedSchemas = schemas as APISchema;
    const templateName = transformedSchemas.templateSource;
    const metadata = allMetadata[templateName];
    // Skip validation if no metadata found
    if (!metadata?.['parameter.vulcan.com']) return;

    const parameters: Parameter[] = metadata['parameter.vulcan.com'];
    parameters.forEach((parameter) => {
      // We only check the first value of nested parameters
      const name = parameter.name.split('.')[0];
      if (
        !transformedSchemas.request.some(
          (paramInSchema) => paramInSchema.fieldName === name
        )
      ) {
        throw new Error(
          `Parameter ${parameter.name} is not found in the schema.`
        );
      }
    });
  };
