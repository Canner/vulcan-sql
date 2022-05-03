/*
=== Schema Sample Format ===
name: user
url: /user/:id
request:
  parameters:
    id:
      in: query # path / query / header
      description: user id
      validators:
        - name: Date
          args:
            format: 'yyyy-MM-dd'
        - name: required
error:
  - code: Forbidden
    message: 'You are not allowed to access this resource'
 */

export enum FieldInType {
  QUERY = 'QUERY',
  HEADER = 'HEADER',
}

export interface ValidatorDefinition<T = any> {
  name: string;
  args: T;
}

export interface RequestParameter {
  fieldName: string;
  // the field put in query parameter or headers
  fieldIn: FieldInType;
  description: string;
  validators: Array<ValidatorDefinition>;
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
  request: Array<RequestParameter>;
  errors: Array<ErrorInfo>;
  response: any;
}

export interface BuiltArtifact {
  apiSchemas: Array<APISchema>;
}
