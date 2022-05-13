import { APISchema } from '@vulcan/core';
import { IRequestTransformer, RequestParameters } from './requestTransformer';
import { IRequestValidator } from './requestValidator';
import { BaseRoute, KoaRouterContext } from './baseRoute';

export class RestfulRoute extends BaseRoute {
  public readonly urlPath: string;

  constructor({
    apiSchema,
    reqTransformer,
    reqValidator,
  }: {
    apiSchema: APISchema;
    reqTransformer: IRequestTransformer;
    reqValidator: IRequestValidator;
  }) {
    super({ apiSchema, reqTransformer, reqValidator });

    this.urlPath = apiSchema.urlPath;
  }

  protected async handleRequest(
    ctx: KoaRouterContext,
    reqParams: RequestParameters
  ) {
    // TODO: implement query by dataset
    ctx.response.body = reqParams;
    return;
  }
}
