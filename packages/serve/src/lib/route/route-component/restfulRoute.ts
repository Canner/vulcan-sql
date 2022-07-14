import { BaseRoute, KoaRouterContext } from './baseRoute';
import { inject, injectable } from 'inversify';
import { TYPES } from '@vulcan-sql/serve/containers';
import { APISchema, TemplateEngine } from '@vulcan-sql/core';
import { IRequestTransformer } from './requestTransformer';
import { IRequestValidator } from './requestValidator';
import { IPaginationTransformer } from './paginationTransformer';

export class RestfulRoute extends BaseRoute {
  public readonly urlPath: string;

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
    super({
      apiSchema,
      reqTransformer,
      reqValidator,
      paginationTransformer,
      templateEngine,
    });
    this.urlPath = apiSchema.urlPath;
  }

  public async respond(ctx: KoaRouterContext) {
    const transformed = await this.prepare(ctx);
    await this.handle(transformed);
    // TODO: get template engine handled result and return response by checking API schema
    ctx.response.body = {
      ...transformed,
    };
  }

  protected async prepare(ctx: KoaRouterContext) {
    // get request data from context
    const reqParams = await this.reqTransformer.transform(ctx, this.apiSchema);
    // validate request format
    await this.reqValidator.validate(reqParams, this.apiSchema);
    // get pagination data from context
    const pagination = await this.paginationTransformer.transform(
      ctx,
      this.apiSchema
    );
    return {
      reqParams,
      pagination,
    };
  }
}
