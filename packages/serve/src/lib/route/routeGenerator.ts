import { IPaginationTransformer } from '@vulcan/serve/route';
import { APISchema, TemplateEngine } from '@vulcan/core';
import {
  RestfulRoute,
  GraphQLRoute,
  IRequestValidator,
  IRequestTransformer,
} from './route-component';
import { inject, injectable } from 'inversify';
import { TYPES as CORE_TYPES } from '@vulcan/core/containers';
import { TYPES } from '../../containers/types';

export enum APIProviderType {
  RESTFUL = 'RESTFUL',
  GRAPHQL = 'GRAPHQL',
}

type RouteComponentType = typeof RestfulRoute | typeof GraphQLRoute;

type APIRouteBuilderOption = {
  [K in APIProviderType]: RouteComponentType;
};

@injectable()
export class RouteGenerator {
  private reqValidator: IRequestValidator;
  private reqTransformer: IRequestTransformer;
  private paginationTransformer: IPaginationTransformer;
  private templateEngine: TemplateEngine;
  private apiOptions: APIRouteBuilderOption = {
    [APIProviderType.RESTFUL]: RestfulRoute,
    [APIProviderType.GRAPHQL]: GraphQLRoute,
  };

  constructor(
    @inject(TYPES.IRequestTransformer) reqTransformer: IRequestTransformer,
    @inject(TYPES.IRequestValidator) reqValidator: IRequestValidator,
    @inject(TYPES.IPaginationTransformer)
    paginationTransformer: IPaginationTransformer,
    @inject(CORE_TYPES.TemplateEngine) templateEngine: TemplateEngine
  ) {
    this.reqValidator = reqValidator;
    this.reqTransformer = reqTransformer;
    this.paginationTransformer = paginationTransformer;
    this.templateEngine = templateEngine;
  }

  public async generate(apiSchema: APISchema, optionType: APIProviderType) {
    if (!(optionType in this.apiOptions))
      throw new Error(`The API type: ${optionType} currently not provided now`);

    return new this.apiOptions[optionType]({
      apiSchema,
      reqTransformer: this.reqTransformer,
      reqValidator: this.reqValidator,
      paginationTransformer: this.paginationTransformer,
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
