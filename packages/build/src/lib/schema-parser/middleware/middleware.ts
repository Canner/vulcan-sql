import { APISchema } from '@vulcan/core';

export interface RawAPISchema extends Partial<APISchema> {
  name: string;
}

export interface SchemaParserMiddleware {
  (schema: RawAPISchema, next: () => Promise<void>): Promise<void>;
}
