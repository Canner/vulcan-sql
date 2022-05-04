import { APISchema } from '@vulcan/core';
import { DeepPartial } from 'ts-essentials';

export interface RawAPISchema extends DeepPartial<APISchema> {
  name: string;
}

export interface SchemaParserMiddleware {
  (schema: RawAPISchema, next: () => Promise<void>): Promise<void>;
}
