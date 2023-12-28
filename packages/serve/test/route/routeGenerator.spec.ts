import faker from '@faker-js/faker';
import * as sinon from 'ts-sinon';
import {
  APISchema,
  DataSource,
  TemplateEngine,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/core';
import {
  APIProviderType,
  GraphQLRoute,
  IRequestTransformer,
  IRequestValidator,
  RestfulRoute,
  RouteGenerator,
  IPaginationTransformer,
} from '@vulcan-sql/serve/route';
import { Container } from 'inversify';
import { TYPES } from '@vulcan-sql/serve/containers';
import { Evaluator } from '@vulcan-sql/serve/evaluator';

describe('Test route generator ', () => {
  let container: Container;
  let stubReqTransformer: sinon.StubbedInstance<IRequestTransformer>;
  let stubReqValidator: sinon.StubbedInstance<IRequestValidator>;
  let stubPaginationTransformer: sinon.StubbedInstance<IPaginationTransformer>;
  let stubTemplateEngine: sinon.StubbedInstance<TemplateEngine>;
  let stubDataSource: sinon.StubbedInstance<DataSource>;
  let stubEvaluator: sinon.StubbedInstance<Evaluator>;
  const fakeSchemas: Array<APISchema> = Array(
    faker.datatype.number({ min: 2, max: 4 })
  ).fill(sinon.stubInterface<APISchema>());
  // url path must be set or router won't initialize
  fakeSchemas.forEach((schema) => (schema.urlPath = '/'));

  beforeEach(() => {
    container = new Container();
    stubReqTransformer = sinon.stubInterface<IRequestTransformer>();
    stubReqValidator = sinon.stubInterface<IRequestValidator>();
    stubPaginationTransformer = sinon.stubInterface<IPaginationTransformer>();
    stubDataSource = sinon.stubInterface<DataSource>();
    stubTemplateEngine = sinon.stubInterface<TemplateEngine>();
    stubEvaluator = sinon.stubInterface<Evaluator>();

    container
      .bind(TYPES.PaginationTransformer)
      .toConstantValue(stubPaginationTransformer);
    container
      .bind(TYPES.RequestTransformer)
      .toConstantValue(stubReqTransformer);
    container.bind(TYPES.RequestValidator).toConstantValue(stubReqValidator);
    container
      .bind(CORE_TYPES.TemplateEngine)
      .toConstantValue(stubTemplateEngine);
    container
      .bind(CORE_TYPES.Factory_DataSource)
      .toConstantValue(() => stubDataSource);
    container.bind(TYPES.RouteGenerator).to(RouteGenerator);
    container.bind(TYPES.Evaluator).toConstantValue(stubEvaluator);
  });

  afterEach(() => {
    container.unbindAll();
  });

  it.each(fakeSchemas)(
    'Should generate restful routes when input schemas and provide restful type',
    async (apiSchema: APISchema) => {
      // Arrange

      const expectedRoute: RestfulRoute = new RestfulRoute({
        apiSchema,
        reqTransformer: container.get<IRequestTransformer>(
          TYPES.RequestTransformer
        ),
        reqValidator: container.get<IRequestValidator>(TYPES.RequestValidator),
        paginationTransformer: container.get<IPaginationTransformer>(
          TYPES.PaginationTransformer
        ),
        templateEngine: container.get<TemplateEngine>(
          CORE_TYPES.TemplateEngine
        ),
        evaluator: container.get<Evaluator>(TYPES.Evaluator),
      });

      // Act
      const routeGenerator = container.get<RouteGenerator>(
        TYPES.RouteGenerator
      );
      const resultRoute = await routeGenerator.generate(
        apiSchema,
        APIProviderType.RESTFUL
      );

      // Assert
      // Need to become json format for matching a object of class
      expect(JSON.stringify(resultRoute)).toEqual(
        JSON.stringify(expectedRoute)
      );
    }
  );

  it.each(fakeSchemas)(
    'Should generate graphQL routes when input schemas and provide graphQL type',
    async (apiSchema: APISchema) => {
      // Arrange
      const expectedRoute: GraphQLRoute = new GraphQLRoute({
        apiSchema,
        reqTransformer: container.get<IRequestTransformer>(
          TYPES.RequestTransformer
        ),
        reqValidator: container.get<IRequestValidator>(TYPES.RequestValidator),
        paginationTransformer: container.get<IPaginationTransformer>(
          TYPES.PaginationTransformer
        ),
        templateEngine: container.get<TemplateEngine>(
          CORE_TYPES.TemplateEngine
        ),
        evaluator: container.get<Evaluator>(TYPES.Evaluator),
      });

      // Act
      const routeGenerator = container.get<RouteGenerator>(
        TYPES.RouteGenerator
      );
      const resultRoute = await routeGenerator.generate(
        apiSchema,
        APIProviderType.GRAPHQL
      );
      // Assert
      // Need to become json format for matching a object of class
      expect(JSON.stringify(resultRoute)).toEqual(
        JSON.stringify(expectedRoute)
      );
    }
  );
});
