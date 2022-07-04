import { Next as KoaNext } from 'koa';
import { RouterContext as KoaRouterContext } from 'koa-router';
import { IRequestTransformer, RequestParameters } from './requestTransformer';
import { IRequestValidator } from './requestValidator';
import { APISchema, TemplateEngine } from '@vulcan/core';
import { IPaginationTransformer, Pagination } from './paginationTransformer';
export { KoaRouterContext, KoaNext };

interface TransformedRequest {
  reqParams: RequestParameters;
  pagination?: Pagination;
}

interface IRoute {
  respond(ctx: KoaRouterContext): Promise<any>;
}

export abstract class BaseRoute implements IRoute {
  public readonly apiSchema: APISchema;
  protected readonly reqTransformer: IRequestTransformer;
  protected readonly reqValidator: IRequestValidator;
  protected readonly templateEngine: TemplateEngine;
  protected readonly paginationTransformer: IPaginationTransformer;
  constructor({
    apiSchema,
    reqTransformer,
    reqValidator,
    paginationTransformer,
    templateEngine,
  }: {
    apiSchema: APISchema;
    reqTransformer: IRequestTransformer;
    reqValidator: IRequestValidator;
    paginationTransformer: IPaginationTransformer;
    templateEngine: TemplateEngine;
  }) {
    this.apiSchema = apiSchema;
    this.reqTransformer = reqTransformer;
    this.reqValidator = reqValidator;
    this.paginationTransformer = paginationTransformer;
    this.templateEngine = templateEngine;
  }

  public abstract respond(ctx: KoaRouterContext): Promise<any>;

  protected abstract prepare(
    ctx: KoaRouterContext
  ): Promise<TransformedRequest>;

  protected async handle(transformed: TransformedRequest) {
    const { reqParams } = transformed;
    // could template name or template path, use for template engine
    const { templateSource } = this.apiSchema;
    const statement = await this.templateEngine.render(
      templateSource,
      reqParams
    );
    return statement;
  }
}
