import { Next as KoaNext } from 'koa';
import { RouterContext as KoaRouterContext } from 'koa-router';
import {
  APISchema,
  TemplateEngine,
  Pagination,
  DataSource,
} from '@vulcan-sql/core';
import { IRequestValidator } from './requestValidator';
import { IRequestTransformer, RequestParameters } from './requestTransformer';
import { IPaginationTransformer } from './paginationTransformer';

export { KoaRouterContext, KoaNext };

export interface TransformedRequest {
  reqParams: RequestParameters;
  pagination?: Pagination;
}

export interface RouteOptions {
  apiSchema: APISchema;
  reqTransformer: IRequestTransformer;
  reqValidator: IRequestValidator;
  paginationTransformer: IPaginationTransformer;
  dataSource: DataSource;
  templateEngine: TemplateEngine;
}

export interface IRoute {
  respond(ctx: KoaRouterContext): Promise<any>;
}

export abstract class BaseRoute implements IRoute {
  public readonly apiSchema: APISchema;
  protected readonly reqTransformer: IRequestTransformer;
  protected readonly reqValidator: IRequestValidator;
  protected readonly templateEngine: TemplateEngine;
  protected readonly dataSource: DataSource;
  protected readonly paginationTransformer: IPaginationTransformer;
  constructor({
    apiSchema,
    reqTransformer,
    reqValidator,
    paginationTransformer,
    dataSource,
    templateEngine,
  }: RouteOptions) {
    this.apiSchema = apiSchema;
    this.reqTransformer = reqTransformer;
    this.reqValidator = reqValidator;
    this.paginationTransformer = paginationTransformer;
    this.dataSource = dataSource;
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
    // prepare query params for providing data source to prevent sql injection when query
    const prepared = await this.dataSource.prepare(reqParams);

    const result = await this.templateEngine.execute(templateSource, {
      ['_prepared']: prepared,
    });
    return result;
  }
}
