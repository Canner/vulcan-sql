import { IPaginationTransformer } from '@vulcan-sql/serve/route';
import {
  APISchema,
  ConfigurationError,
  TemplateEngine,
} from '@vulcan-sql/api-layer';
import {
  RestfulRoute,
  GraphQLRoute,
  IRequestValidator,
  IRequestTransformer,
} from './route-component';
import { inject, injectable } from 'inversify';
import { TYPES as CORE_TYPES } from '@vulcan-sql/api-layer';
import { TYPES } from '../../containers/types';
import { Evaluator } from '../evaluator';

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
  private evaluator: Evaluator;
  private apiOptions: APIRouteBuilderOption = {
    [APIProviderType.RESTFUL]: RestfulRoute,
    [APIProviderType.GRAPHQL]: GraphQLRoute,
  };

  constructor(
    @inject(TYPES.RequestTransformer) reqTransformer: IRequestTransformer,
    @inject(TYPES.RequestValidator) reqValidator: IRequestValidator,
    @inject(TYPES.PaginationTransformer)
    paginationTransformer: IPaginationTransformer,
    @inject(CORE_TYPES.TemplateEngine) templateEngine: TemplateEngine,
    @inject(TYPES.Evaluator) evaluator: Evaluator
  ) {
    this.reqValidator = reqValidator;
    this.reqTransformer = reqTransformer;
    this.paginationTransformer = paginationTransformer;
    this.templateEngine = templateEngine;
    this.evaluator = evaluator;
  }

  public async generate(apiSchema: APISchema, optionType: APIProviderType) {
    if (!(optionType in this.apiOptions))
      throw new ConfigurationError(
        `The API type: ${optionType} currently not provided now`
      );

    return new this.apiOptions[optionType]({
      apiSchema,
      reqTransformer: this.reqTransformer,
      reqValidator: this.reqValidator,
      paginationTransformer: this.paginationTransformer,
      templateEngine: this.templateEngine,
      evaluator: this.evaluator,
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
