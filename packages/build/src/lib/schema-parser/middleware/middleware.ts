import {
  APISchema,
  FieldDataType,
  RequestSchema as RequestParameter,
  ResponseProperty,
  ValidatorDefinition,
} from '@vulcan-sql/core';
import { injectable } from 'inversify';
import { DeepPartial } from 'ts-essentials';

export interface RawRequestParameter
  extends Omit<RequestParameter, 'validators'> {
  validators: Array<ValidatorDefinition | string>;
}

export interface RawResponseProperty extends Omit<ResponseProperty, 'type'> {
  type: string | FieldDataType | Array<RawResponseProperty>;
}

export interface RawAPISchema
  extends DeepPartial<Omit<APISchema, 'request' | 'response'>> {
  /** Indicate the identifier of this schema from the source, it might be uuid, file path, url ...etc, depend on the provider */
  sourceName: string;
  request?: DeepPartial<RawRequestParameter[]>;
  response?: DeepPartial<RawResponseProperty[]>;
  metadata?: Record<string, any>;
}

@injectable()
export abstract class SchemaParserMiddleware {
  abstract handle(
    schema: RawAPISchema,
    next: () => Promise<void>
  ): Promise<void>;
}
