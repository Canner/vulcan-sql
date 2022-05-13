import faker from '@faker-js/faker';
import * as sinon from 'ts-sinon';
import { APISchema } from '@vulcan/core';
import {
  APIProviderType,
  GraphQLRoute,
  IRequestTransformer,
  IRequestValidator,
  RestfulRoute,
  RouteGenerator,
} from '@route-generator/.';

describe('Test route generator ', () => {
  let stubReqTransformer: sinon.StubbedInstance<IRequestTransformer>;
  let stubReqValidator: sinon.StubbedInstance<IRequestValidator>;
  const fakeSchemas: Array<APISchema> = Array(
    faker.datatype.number({ min: 2, max: 4 })
  ).fill(sinon.stubInterface<APISchema>());

  beforeEach(() => {
    stubReqTransformer = sinon.stubInterface<IRequestTransformer>();
    stubReqValidator = sinon.stubInterface<IRequestValidator>();
  });

  it.each(fakeSchemas)(
    'Should generate restful routes when input schemas and provide restful type',
    async (apiSchema: APISchema) => {
      // Arrange
      const expectedRoute: RestfulRoute = new RestfulRoute({
        apiSchema,
        reqTransformer: stubReqTransformer,
        reqValidator: stubReqValidator,
      });
      const routeGenerator = new RouteGenerator({
        reqTransformer: stubReqTransformer,
        reqValidator: stubReqValidator,
      });

      // Act
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
        reqTransformer: stubReqTransformer,
        reqValidator: stubReqValidator,
      });
      const routeGenerator = new RouteGenerator({
        reqTransformer: stubReqTransformer,
        reqValidator: stubReqValidator,
      });

      // Act
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
