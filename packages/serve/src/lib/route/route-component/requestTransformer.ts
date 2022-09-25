import {
  APISchema,
  ConfigurationError,
  FieldDataType,
  FieldInType,
  normalizeStringValue,
  RequestSchema,
} from '@vulcan-sql/core';
import { injectable } from 'inversify';
import { assign } from 'lodash';
import { KoaContext } from '@vulcan-sql/serve/models';

export interface RequestParameters {
  [name: string]: any;
}

export interface IRequestTransformer {
  transform(ctx: KoaContext, apiSchema: APISchema): Promise<RequestParameters>;
}

@injectable()
export class RequestTransformer implements IRequestTransformer {
  public static readonly fieldInMapper: {
    [type in FieldInType]: (ctx: KoaContext, fieldName: string) => string;
  } = {
    [FieldInType.HEADER]: (ctx: KoaContext, fieldName: string) =>
      ctx.request.header[fieldName] as string,
    [FieldInType.QUERY]: (ctx: KoaContext, fieldName: string) =>
      ctx.request.query[fieldName] as string,
    [FieldInType.PATH]: (ctx: KoaContext, fieldName: string) =>
      ctx.params[fieldName] as string,
  };

  public static readonly convertTypeMapper: {
    [type in FieldDataType]: (value: string, name: string) => any;
  } = {
    [FieldDataType.NUMBER]: (value: string, name: string) =>
      normalizeStringValue(value, name, Number.name),
    [FieldDataType.STRING]: (value: string, name: string) =>
      normalizeStringValue(value, name, String.name),
    [FieldDataType.BOOLEAN]: (value: string, name: string) =>
      normalizeStringValue(value, name, Boolean.name),
  };

  public async transform(
    ctx: KoaContext,
    apiSchema: APISchema
  ): Promise<RequestParameters> {
    const paramList = await Promise.all(
      apiSchema.request.map(async (schemaReqParam: RequestSchema) => {
        const { fieldName, fieldIn, type } = schemaReqParam;
        // Get request value according field-in type
        const fieldValue = RequestTransformer.fieldInMapper[fieldIn](
          ctx,
          fieldName
        );
        const formattedValue = await this.convertDataType(
          fieldName,
          fieldValue,
          type
        );
        // transform format to { name: value }
        return { [fieldName]: formattedValue };
      })
    );
    // combine all param list to one object for { name: value } format
    const params = assign({}, ...paramList);
    return params;
  }

  // check data type of one parameter by input type and convert it
  private async convertDataType(
    name: string,
    value: string,
    type: FieldDataType
  ) {
    if (!Object.values(FieldDataType).includes(type))
      throw new ConfigurationError(
        `The ${type} type not been implemented now.`
      );

    return RequestTransformer.convertTypeMapper[type](value, name);
  }
}
