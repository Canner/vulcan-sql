import { BaseRoute, KoaRouterContext, RouteOptions } from './baseRoute';

export class RestfulRoute extends BaseRoute {
  public readonly urlPath: string;

  constructor(options: RouteOptions) {
    super(options);
    const { apiSchema } = options;
    this.urlPath = apiSchema.urlPath;
  }

  public async respond(ctx: KoaRouterContext) {
    const transformed = await this.prepare(ctx);
    const result = await this.handle(transformed);
    ctx.response.body = {
      data: result.getData(),
      columns: result.getColumns(),
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
