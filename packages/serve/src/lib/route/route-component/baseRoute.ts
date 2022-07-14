import { Next as KoaNext } from 'koa';
import { RouterContext as KoaRouterContext } from 'koa-router';
import { APISchema, TemplateEngine, Pagination } from '@vulcan-sql/core';
import { IRequestValidator } from './requestValidator';
import { IRequestTransformer, RequestParameters } from './requestTransformer';
import { IPaginationTransformer } from './paginationTransformer';

export { KoaRouterContext, KoaNext };

export interface TransformedRequest {
  reqParams: RequestParameters;
  pagination?: Pagination;
}

export interface IRoute {
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
    const statement = await this.templateEngine.execute(
      templateSource,
      reqParams
    );
    return statement;
  }
}
