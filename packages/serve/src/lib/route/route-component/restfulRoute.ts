import { BaseRoute, RouteOptions } from './baseRoute';
import { KoaContext } from '@vulcan-sql/serve/models';
export class RestfulRoute extends BaseRoute {
  public readonly urlPath: string;

  constructor(options: RouteOptions) {
    super(options);
    const { apiSchema } = options;
    this.urlPath = apiSchema.urlPath;
  }

  public async respond(ctx: KoaContext) {
    const transformed = await this.prepare(ctx);
    const authUser = ctx.state.user;
    const result = await this.handle(authUser, transformed);
    ctx.response.body = {
      data: result.getData(),
      columns: result.getColumns(),
    };
  }

  protected async prepare(ctx: KoaContext) {
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
