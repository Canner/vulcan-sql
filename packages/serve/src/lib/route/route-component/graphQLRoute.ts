/* istanbul ignore file */
import { BaseRoute, RouteOptions } from './baseRoute';
import { KoaContext } from '@vulcan-sql/serve/models';
import { KoaRequest } from '@vulcan-sql/api-layer';

export class GraphQLRoute extends BaseRoute {
  public readonly operationName: string;

  constructor(options: RouteOptions) {
    super(options);
    const { apiSchema } = options;
    this.operationName = apiSchema.operationName;
  }

  public async makeTypeDefs() {
    // TODO: generate graphql type by api schema
  }

  public async respond(ctx: KoaContext) {
    const transformed = await this.prepare(ctx);
    const authUser = ctx.state.user;
    const req = ctx.request as KoaRequest;
    const headers = ctx.headers;
    await this.handle(authUser, transformed, req, headers);
    // TODO: get template engine handled result and return response by checking API schema
    return transformed;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async prepare(_ctx: KoaContext) {
    /**
     * TODO: the graphql need to transform from body.
     * Therefore, current request and pagination transformer not suitable (need to provide another graphql transform method or class)
     */

    return {
      reqParams: {},
    };
  }
}
