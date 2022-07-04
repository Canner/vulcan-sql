import { APISchema } from '@vulcan/core';
import { IRequestTransformer, RequestParameters } from './requestTransformer';
import { IRequestValidator } from './requestValidator';
import { BaseRoute, KoaRouterContext } from './baseRoute';

export class GraphQLRoute extends BaseRoute {
  public readonly operationName: string;

  constructor({
    apiSchema,
    reqTransformer,
    reqValidator,
  }: {
    apiSchema: APISchema;
    reqTransformer: IRequestTransformer;
    reqValidator: IRequestValidator;
  }) {
    super({ apiSchema, reqTransformer, reqValidator });

    this.operationName = apiSchema.operationName;
  }

  public async makeTypeDefs() {
    // TODO: generate graphql type by api schema
  }

  protected async handleRequest(
    ctx: KoaRouterContext,
    reqParams: RequestParameters
  ) {
    // TODO: implement query by dataset
    return reqParams;
  }
}
