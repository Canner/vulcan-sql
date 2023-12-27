import { FieldDataType, FieldInType } from '@vulcan-sql/api-layer';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';

// /user/{id} => {request: [{fieldName: 'id', fieldIn: 'path' ....}]}
export class GeneratePathParameters extends SchemaParserMiddleware {
  public async handle(schema: RawAPISchema, next: () => Promise<void>) {
    await next();
    const pattern = /:([^/]+)/g;
    const pathParameters: string[] = [];

    let param = pattern.exec(schema.urlPath || '');
    while (param) {
      pathParameters.push(param[1]);
      param = pattern.exec(schema.urlPath || '');
    }

    const request = schema.request || [];
    pathParameters
      .filter((param) => !request.some((req) => req.fieldName === param))
      .forEach((param) =>
        request.push({
          fieldName: param,
          fieldIn: FieldInType.PATH,
          type: FieldDataType.STRING,
          validators: [
            {
              name: 'required',
              args: {},
            },
          ],
        })
      );
    schema.request = request;
  }
}
