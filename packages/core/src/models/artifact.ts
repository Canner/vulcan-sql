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

import { Constraint } from '../lib/validators/constraints';

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

export interface ValidatorDefinition<T = any> {
  name: string;
  args: T;
}

export interface RequestSchema {
  fieldName: string;
  // the field put in query parameter or headers
  fieldIn: FieldInType;
  description: string;
  type: FieldDataType;
  validators: Array<ValidatorDefinition>;
  constraints: Array<Constraint>;
}

export interface ResponseProperty {
  name: string;
  description?: string;
  type: FieldDataType | Array<ResponseProperty>;
  required?: boolean;
}

export interface PaginationSchema {
  mode: PaginationMode;
  // The key name used for do filtering by key for keyset pagination.
  keyName?: string;
}

export interface ErrorInfo {
  code: string;
  message: string;
}

export interface Sample {
  profile: string;
  parameters: Record<string, any>;
}

export interface APISchema {
  // graphql operation name
  operationName: string;
  // restful url path
  urlPath: string;
  // template, could be name or path
  templateSource: string;
  request: Array<RequestSchema>;
  errors: Array<ErrorInfo>;
  response: Array<ResponseProperty>;
  description?: string;
  // The pagination strategy that do paginate when querying
  // If not set pagination, then API request not provide the field to do it
  pagination?: PaginationSchema;
  sample?: Sample;
  profiles: Array<string>;
}

export interface BuiltArtifact {
  apiSchemas: Array<APISchema>;
}
