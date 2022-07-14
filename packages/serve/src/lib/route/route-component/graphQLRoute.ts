import { BaseRoute, KoaRouterContext } from './baseRoute';

import { APISchema, TemplateEngine } from '@vulcan-sql/core';
import { IRequestTransformer } from './requestTransformer';
import { IRequestValidator } from './requestValidator';
import { IPaginationTransformer } from './paginationTransformer';

export class GraphQLRoute extends BaseRoute {
  public readonly operationName: string;

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

    this.operationName = apiSchema.operationName;
  }

  public async makeTypeDefs() {
    // TODO: generate graphql type by api schema
  }

  public async respond(ctx: KoaRouterContext) {
    const transformed = await this.prepare(ctx);
    await this.handle(transformed);
    // TODO: get template engine handled result and return response by checking API schema
    return transformed;
  }

  protected async prepare(ctx: KoaRouterContext) {
    /**
     * TODO: the graphql need to transform from body.
     * Therefore, current request and pagination transformer not suitable (need to provide another graphql transform method or class)
     */

    return {
      reqParams: {},
    };
  }
}
