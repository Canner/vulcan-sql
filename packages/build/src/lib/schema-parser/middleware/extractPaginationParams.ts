import {
  APISchema,
  FieldDataType,
  FieldInType,
  PaginationMode,
  RequestSchema,
} from '@vulcan-sql/api-layer';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';

export class ExtractPaginationParams extends SchemaParserMiddleware {
  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    await next();
    const transformedSchemas = schemas as APISchema;
    const paginationParameters: RequestSchema[] = [];
    if (transformedSchemas.pagination?.mode === PaginationMode.OFFSET) {
      paginationParameters.push({
        fieldName: 'limit',
        fieldIn: FieldInType.QUERY,
        description:
          'Offset-based Pagination: The maximum number of rows to return. default: 20',
        type: FieldDataType.STRING, // We should use STRING type here but not NUMBER because of the issue from normalizeStringValue function (it throw error when input is undefined)
        validators: [{ name: 'integer', args: { min: 0 } }],
        constraints: [],
      });
      paginationParameters.push({
        fieldName: 'offset',
        fieldIn: FieldInType.QUERY,
        description:
          'Offset-based Pagination: The offset from the row. default: 0',
        type: FieldDataType.STRING,
        validators: [{ name: 'integer', args: { min: 0 } }],
        constraints: [],
      });
    }

    // merge parameters
    for (const param of paginationParameters) {
      const existed = transformedSchemas.request.find(
        (req) =>
          req.fieldName === param.fieldName && req.fieldIn === param.fieldIn
      );
      if (existed) {
        existed.description = existed.description || param.description;
        existed.validators = [...existed.validators, ...param.validators];
      } else {
        transformedSchemas.request.push(param);
      }
    }
  }
}
