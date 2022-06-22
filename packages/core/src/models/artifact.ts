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

export enum PaginationMode {
  CURSOR = 'cursor',
  OFFSET = 'offset',
  KEYSET = 'keyset',
}

export enum FieldInType {
  QUERY = 'query',
  HEADER = 'header',
  PATH = 'path',
}

export enum FieldDataType {
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  STRING = 'string',
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

export interface APISchema {
  // graphql operation name
  operationName: string;
  // restful url path
  urlPath: string;
  // template, could be name or path
  templateSource: string;
  request: Array<RequestSchema>;
  errors: Array<ErrorInfo>;
  response: any;
  // The pagination strategy that do paginate when querying
  // If not set pagination, then API request not provide the field to do it
  pagination?: PaginationSchema;
}

export interface BuiltArtifact {
  apiSchemas: Array<APISchema>;
}
