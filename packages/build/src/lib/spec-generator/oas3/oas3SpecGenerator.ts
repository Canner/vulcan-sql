import { SpecGenerator } from '../specGenerator';
import * as oas3 from 'openapi3-ts';
import {
  APISchema,
  FieldDataType,
  FieldInType,
  RequestParameter,
} from '@vulcan/core';

export class OAS3SpecGenerator extends SpecGenerator<oas3.OpenAPIObject> {
  // Follow the OpenAPI specification version 3.0.3
  // see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md
  private oaiVersion = '3.0.3';

  public getSpec() {
    const spec: oas3.OpenAPIObject = {
      openapi: this.getOAIVersion(),
      info: this.getInfo(),
      paths: this.getPaths(),
    };
    return spec;
  }

  public getOAIVersion() {
    return this.oaiVersion;
  }

  private getInfo(): oas3.InfoObject {
    return {
      title: this.getName(),
      version: this.getVersion(),
      description: this.getDescription(),
    };
  }

  private getPaths(): oas3.PathsObject {
    const paths: oas3.PathsObject = {};
    const schemas = this.getSchemas();
    for (const schema of schemas) {
      paths[this.convertToOASPath(schema.urlPath)] = this.getPath(schema);
    }
    return paths;
  }

  private getPath(schema: APISchema): oas3.PathItemObject {
    return {
      get: this.getOperationObject(schema),
    };
  }

  // "/user/:id" -> "/user/{id}"
  private convertToOASPath(path: string) {
    return path.replace(/:([^/]+)/g, (_, param) => {
      return `{${param}}`;
    });
  }

  private getOperationObject(schema: APISchema): oas3.OperationObject {
    return {
      description: schema.description,
      responses: {},
      parameters: this.getParameterObject(schema),
    };
  }

  private getParameterObject(schema: APISchema): oas3.ParameterObject[] {
    const parameters: oas3.ParameterObject[] = [];
    const requests = schema.request || [];

    for (const param of requests) {
      parameters.push({
        name: param.fieldName,
        in: this.convertFileInTypeToOASIn(param.fieldIn),
        schema: this.getSchemaObject(param),
      });
    }

    return parameters;
  }

  private convertFileInTypeToOASIn(
    fieldInType: FieldInType
  ): oas3.ParameterLocation {
    switch (fieldInType) {
      case FieldInType.HEADER:
        return 'header';
      case FieldInType.PATH:
        return 'path';
      case FieldInType.QUERY:
        return 'query';
      default:
        throw new Error(`FieldInType ${fieldInType} is not supported`);
    }
  }

  private getSchemaObject(parameter: RequestParameter): oas3.SchemaObject {
    return {
      type: this.convertFieldDataTypeToOASType(parameter.type),
    };
  }

  private convertFieldDataTypeToOASType(
    fieldDataType: FieldDataType
  ): oas3.SchemaObject['type'] {
    switch (fieldDataType) {
      case FieldDataType.BOOLEAN:
        return 'boolean';
      case FieldDataType.NUMBER:
        return 'number';
      case FieldDataType.STRING:
        return 'string';
      default:
        throw new Error(`FieldDataType ${fieldDataType} is not supported`);
    }
  }
}
