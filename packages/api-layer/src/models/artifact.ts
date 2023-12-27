/*
=== Schema Sample Format ===
name: user
url: /user/:id
request:
  parameters:
    id:
      in: query # three source: path / query / header
      description: user id
      type: integer # three types: boolean / number / string
      validators:
        - name: date
          args:
            format: 'yyyy-MM-dd'
        - name: required
error:
  - code: Forbidden
    message: 'You are not allowed to access this resource'
 */

// This is the model of our built result
// It will be serialized and deserialized by class-transformer
// https://github.com/typestack/class-transformer/tree/master
// So we should use classes instead of interfaces.

import {
  Constraint,
  ConstraintDiscriminator,
} from '../lib/validators/constraints';
import { Type } from 'class-transformer';
import 'reflect-metadata';
import { Request as KoaRequest } from 'koa';
import { IncomingHttpHeaders } from 'http';

export type { KoaRequest };
export type { IncomingHttpHeaders };

// Pagination mode should always be UPPERCASE because schema parser will transform the user inputs.
export enum PaginationMode {
  CURSOR = 'CURSOR',
  OFFSET = 'OFFSET',
  KEYSET = 'KEYSET',
}

export enum FieldInType {
  QUERY = 'QUERY',
  HEADER = 'HEADER',
  PATH = 'PATH',
}

export enum FieldDataType {
  BOOLEAN = 'BOOLEAN',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
}

export class ValidatorDefinition<T = any> {
  name!: string;
  args!: T;
}

export class RequestSchema {
  fieldName!: string;
  // the field put in query parameter or headers
  fieldIn!: FieldInType;
  description!: string;
  type!: FieldDataType;
  validators!: Array<ValidatorDefinition>;
  @Type(() => Constraint, {
    discriminator: ConstraintDiscriminator,
  })
  constraints!: Array<Constraint>;
}

export class ResponseProperty {
  name!: string;
  description?: string;
  type!: FieldDataType | Array<ResponseProperty>;
  required?: boolean;
}

export class PaginationSchema {
  mode!: PaginationMode;
  // The key name used for do filtering by key for keyset pagination.
  keyName?: string;
}

export class ErrorInfo {
  code!: string;
  message!: string;
}

export class Sample {
  profile!: string;
  parameters!: Record<string, any>;
  req?: KoaRequest;
}

export class RefreshTime {
  every!: string;
}

export class RefreshExpression {
  expression!: string;
  every!: string;
}

export class CacheLayerInfo {
  // the table name kept in cache
  cacheTableName!: string;
  // the used profile to query the data from data source
  profile!: string;
  // the sql to query the data from data source and put in cache by "cacheTableName"
  sql!: string;
  refreshTime?: RefreshTime;
  refreshExpression?: RefreshExpression;
  // index key name -> index column
  indexes?: Record<string, string>;
  // cache folder subpath
  folderSubpath?: string;
  // options pass to the data source
  options?: any;
}

export class APISchema {
  // graphql operation name
  operationName!: string;
  // restful url path
  urlPath!: string;
  // template, could be name or path
  templateSource!: string;
  @Type(() => RequestSchema)
  request!: Array<RequestSchema>;
  @Type(() => ErrorInfo)
  errors!: Array<ErrorInfo>;
  @Type(() => ResponseProperty)
  response!: Array<ResponseProperty>;
  description?: string;
  // The pagination strategy that do paginate when querying
  // If not set pagination, then API request not provide the field to do it
  pagination?: PaginationSchema;
  sample?: Sample;
  profiles!: Array<string>;
  cache!: Array<CacheLayerInfo>;
}

export class BuiltArtifact {
  @Type(() => APISchema)
  schemas!: Array<APISchema>;
}
