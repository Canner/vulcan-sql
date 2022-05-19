import {
  APISchema,
  RequestSchema as RequestParameter,
  ValidatorDefinition,
} from '@vulcan/core';
import { DeepPartial } from 'ts-essentials';

export interface RawRequestParameter
  extends Omit<RequestParameter, 'validators'> {
  validators: Array<ValidatorDefinition | string>;
}

export interface RawAPISchema extends DeepPartial<Omit<APISchema, 'request'>> {
  sourceName: string;
  request?: DeepPartial<RawRequestParameter[]>;
}

export interface SchemaParserMiddleware {
  (schema: RawAPISchema, next: () => Promise<void>): Promise<void>;
}
