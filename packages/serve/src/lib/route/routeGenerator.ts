import { APISchema, TemplateEngine } from '@vulcan/core';

import {
  RestfulRoute,
  GraphQLRoute,
  IRequestValidator,
  IRequestTransformer,
} from './route-component';

export enum APIProviderType {
  RESTFUL = 'RESTFUL',
  GRAPHQL = 'GRAPHQL',
}

type RouteComponentType = typeof RestfulRoute | typeof GraphQLRoute;

type APIRouteBuilderOption = {
  [K in APIProviderType]: RouteComponentType;
};

export class RouteGenerator {
  private reqValidator: IRequestValidator;
  private reqTransformer: IRequestTransformer;
  private templateEngine: TemplateEngine;
  private apiOptions: APIRouteBuilderOption = {
    [APIProviderType.RESTFUL]: RestfulRoute,
    [APIProviderType.GRAPHQL]: GraphQLRoute,
  };

  constructor({
    reqValidator,
    reqTransformer,
    templateEngine,
  }: {
    reqValidator: IRequestValidator;
    reqTransformer: IRequestTransformer;
    templateEngine: TemplateEngine;
  }) {
    this.reqValidator = reqValidator;
    this.reqTransformer = reqTransformer;
    this.templateEngine = templateEngine;
  }

  public async generate(apiSchema: APISchema, optionType: APIProviderType) {
    if (!(optionType in this.apiOptions))
      throw new Error(`The API type: ${optionType} currently not provided now`);

    return new this.apiOptions[optionType]({
      apiSchema,
      reqTransformer: this.reqTransformer,
      reqValidator: this.reqValidator,
      templateEngine: this.templateEngine,
    });
  }

  public async multiGenerate(
    schemas: Array<APISchema>,
    optionType: APIProviderType
  ) {
    return Promise.all(
      schemas.map(async (schema) => await this.generate(schema, optionType))
    );
  }
}