import { BaseRoute, KoaRouterContext, RouteOptions } from './baseRoute';

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

  public async respond(ctx: KoaRouterContext) {
    const transformed = await this.prepare(ctx);
    await this.handle(transformed);
    // TODO: get template engine handled result and return response by checking API schema
    return transformed;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async prepare(_ctx: KoaRouterContext) {
    /**
     * TODO: the graphql need to transform from body.
     * Therefore, current request and pagination transformer not suitable (need to provide another graphql transform method or class)
     */

    return {
      reqParams: {},
    };
  }
}
