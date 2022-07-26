import { FieldDataType } from '@vulcan-sql/core';
import { DeepPartial } from 'ts-essentials';
import {
  RawAPISchema,
  RawResponseProperty,
  SchemaParserMiddleware,
} from './middleware';

const generateResponsePropertyType = (
  property: DeepPartial<RawResponseProperty>
) => {
  if (!property.type) {
    property.type = FieldDataType.STRING;
  } else if (Array.isArray(property.type)) {
    ((property.type as DeepPartial<RawResponseProperty>[]) || []).forEach(
      (property) => generateResponsePropertyType(property)
    );
  }
};

// Fallback to string when type is not defined.
// TODO: Guess the type by validators.
export class GenerateDataType extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    await next();
    (schemas.request || []).forEach((request) => {
      if (!request.type) {
        request.type = FieldDataType.STRING;
      }
    });
    (schemas.response || []).forEach((property) =>
      generateResponsePropertyType(property)
    );
  }
}
