import { Next as KoaNext } from 'koa';
import { RouterContext as KoaRouterContext } from 'koa-router';
import { IRequestTransformer, RequestParameters } from './requestTransformer';
import { IRequestValidator } from './requestValidator';
import { APISchema } from '@vulcan/core';
export { KoaRouterContext, KoaNext };

interface IRoute {
  respond(ctx: KoaRouterContext): Promise<any>;
}

export abstract class BaseRoute implements IRoute {
  public readonly apiSchema: APISchema;
  private readonly reqTransformer: IRequestTransformer;
  private readonly reqValidator: IRequestValidator;

  constructor({
    apiSchema,
    reqTransformer,
    reqValidator,
  }: {
    apiSchema: APISchema;
    reqTransformer: IRequestTransformer;
    reqValidator: IRequestValidator;
  }) {
    this.apiSchema = apiSchema;
    this.reqTransformer = reqTransformer;
    this.reqValidator = reqValidator;
  }

  public async respond(ctx: KoaRouterContext) {
    const params = await this.reqTransformer.transform(ctx, this.apiSchema);
    await this.reqValidator.validate(params, this.apiSchema);
    return await this.handleRequest(ctx, params);
  }

  protected abstract handleRequest(
    ctx: KoaRouterContext,
    reqParams: RequestParameters
  ): Promise<any>;
}
