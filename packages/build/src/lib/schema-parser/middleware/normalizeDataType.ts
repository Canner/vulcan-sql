import { FieldDataType } from '@vulcan-sql/core';
import { DeepPartial } from 'ts-essentials';
import {
  RawAPISchema,
  RawResponseProperty,
  SchemaParserMiddleware,
} from './middleware';

const normalizedResponsePropertyType = (
  property: DeepPartial<RawResponseProperty>
) => {
  if (typeof property.type === 'string') {
    property.type = property.type.toUpperCase() as FieldDataType;
  } else {
    ((property.type as DeepPartial<RawResponseProperty>[]) || []).forEach(
      (property) => normalizedResponsePropertyType(property)
    );
  }
};

// type: string => FieldIn FieldDataType.STRING
export class NormalizeDataType extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    // Request
    (schemas.request || []).forEach((request) => {
      if (request.type) {
        request.type = request.type.toUpperCase() as FieldDataType;
      }
    });
    // Response
    (schemas.response || []).forEach((property) =>
      normalizedResponsePropertyType(property)
    );

    return next();
  }
}
