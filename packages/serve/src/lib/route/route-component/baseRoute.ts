import { Next as KoaNext } from 'koa';
import { RouterContext as KoaRouterContext } from 'koa-router';
import { IRequestTransformer, RequestParameters } from './requestTransformer';
import { IRequestValidator } from './requestValidator';
import { APISchema, TemplateEngine } from '@vulcan/core';
export { KoaRouterContext, KoaNext };

interface IRoute {
  respond(ctx: KoaRouterContext): Promise<any>;
}

export abstract class BaseRoute implements IRoute {
  public readonly apiSchema: APISchema;
  private readonly reqTransformer: IRequestTransformer;
  private readonly reqValidator: IRequestValidator;
  private readonly templateEngine: TemplateEngine;

  constructor({
    apiSchema,
    reqTransformer,
    reqValidator,
    templateEngine,
  }: {
    apiSchema: APISchema;
    reqTransformer: IRequestTransformer;
    reqValidator: IRequestValidator;
    templateEngine: TemplateEngine;
  }) {
    this.apiSchema = apiSchema;
    this.reqTransformer = reqTransformer;
    this.reqValidator = reqValidator;
    this.templateEngine = templateEngine;
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

  protected async runQuery(reqParams: RequestParameters) {
    // could template name or template path, use for template engine
    const { templateSource } = this.apiSchema;
    const statement = await this.templateEngine.render(
      templateSource,
      reqParams
    );
    return statement;
  }
}
