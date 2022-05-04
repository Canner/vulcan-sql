import { APISchema, RequestParameter, ValidatorDefinition } from '@vulcan/core';
import { DeepPartial } from 'ts-essentials';

export interface RawRequestParameter
  extends Omit<RequestParameter, 'validators'> {
  validators: Array<ValidatorDefinition | string>;
}

export interface RawAPISchema extends DeepPartial<Omit<APISchema, 'request'>> {
  name: string;
  request?: DeepPartial<RawRequestParameter[]>;
}

export interface SchemaParserMiddleware {
  (schema: RawAPISchema, next: () => Promise<void>): Promise<void>;
}
