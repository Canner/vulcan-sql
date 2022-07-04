import * as sinon from 'ts-sinon';
import * as supertest from 'supertest';
import faker from '@faker-js/faker';
import { Request } from 'koa';
import * as KoaRouter from 'koa-router';
import { VulcanApplication, VulcanServer } from '@app';
import {
  APISchema,
  FieldDataType,
  FieldInType,
  RequestSchema,
  TemplateEngine,
  ValidatorDefinition,
} from '@vulcan/core';

import {
  RouteGenerator,
  APIProviderType,
  KoaRouterContext,
  RequestParameters,
  RequestTransformer,
  RequestValidator,
} from '@route/.';
import { PaginationTransformer } from '@route/.';

describe('Test vulcan server to call restful APIs', () => {
  let server: VulcanServer;
  let stubTemplateEngine: sinon.StubbedInstance<TemplateEngine>;
  const fakeSchemas: Array<APISchema> = [
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/department/:id/employees/:uuid`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'id',
          type: FieldDataType.NUMBER,
          fieldIn: FieldInType.PATH,
          validators: [
            {
              name: 'integer',
            },
          ] as Array<ValidatorDefinition>,
        },
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'uuid',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.PATH,
          validators: [
            {
              name: 'uuid',
            },
          ] as Array<ValidatorDefinition>,
        },
      ],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/orders/:uuid`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'uuid',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.PATH,
          validators: [
            {
              name: 'uuid',
            },
          ] as Array<ValidatorDefinition>,
        },
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'domain',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.HEADER,
          validators: [
            {
              name: 'string',
            },
          ] as Array<ValidatorDefinition>,
        },
      ],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/searchOrders`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'keywords',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.QUERY,
          validators: [
            {
              name: 'string',
            },
          ] as Array<ValidatorDefinition>,
        },
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'domain',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.HEADER,
          validators: [
            {
              name: 'string',
            },
          ] as Array<ValidatorDefinition>,
        },
      ],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/searchProducts`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'keywords',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.QUERY,
          validators: [
            {
              name: 'string',
            },
          ] as Array<ValidatorDefinition>,
        },
      ],
    },
  ];

  const fakeKoaContexts: Array<KoaRouterContext> = [
    {
      ...sinon.stubInterface<KoaRouterContext>(),
      params: {
        id: faker.datatype.number().toString(),
        uuid: faker.datatype.uuid(),
      },
    },
    {
      ...sinon.stubInterface<KoaRouterContext>(),
      params: {
        uuid: faker.datatype.uuid(),
      },
      request: {
        ...sinon.stubInterface<Request>(),
        header: {
          domain: faker.internet.domainName(),
        },
      },
    },
    {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        header: {
          domain: faker.internet.domainName(),
        },
        query: {
          keywords: faker.random.words(),
        },
      },
    },
    {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          keywords: faker.random.words(),
        },
      },
    },
  ];

  beforeAll(async () => {
    const reqTransformer = new RequestTransformer();
    const reqValidator = new RequestValidator();
    const paginationTransformer = new PaginationTransformer();
    stubTemplateEngine = sinon.stubInterface<TemplateEngine>();

    const generator = new RouteGenerator({
      reqTransformer,
      reqValidator,
      paginationTransformer,
      templateEngine: stubTemplateEngine,
    });
    const routes = await generator.multiGenerate(
      fakeSchemas,
      APIProviderType.RESTFUL
    );
    const app = new VulcanApplication();
    await app.setRoutes(routes, APIProviderType.RESTFUL);
    server = app.listen(3000);
  });

  afterAll(() => {
    server.close();
  });

  it.each([
    ['path nested parameters', fakeSchemas[0], fakeKoaContexts[0]],
    ['path & header parameters', fakeSchemas[1], fakeKoaContexts[1]],
    ['query & header parameters', fakeSchemas[2], fakeKoaContexts[2]],
    ['query parameters', fakeSchemas[3], fakeKoaContexts[3]],
  ])(
    'Should be correct when given validated koa context request from %p',
    async (_: string, schema: APISchema, ctx: KoaRouterContext) => {
      // Arrange

      // arrange input api url
      const apiUrl = KoaRouter.url(schema.urlPath, ctx.params);

      // arrange expected result
      const expected: RequestParameters = {};
      schema.request.map((param: RequestSchema) => {
        const fieldValue = RequestTransformer.fieldInMapper[param.fieldIn](
          ctx,
          param.fieldName
        );
        expected[param.fieldName] = RequestTransformer.convertTypeMapper[
          param.type
        ](fieldValue, param.fieldName);
      });

      // Act
      let reqOperation = supertest(server).get(apiUrl);

      // if request context exist setting the request input
      if (ctx.request) {
        // set query data to request if exist
        reqOperation = ctx.request.query
          ? reqOperation.query(ctx.request.query)
          : reqOperation;
        // set header data to request if exist
        reqOperation = ctx.request.header
          ? reqOperation.set(ctx.request.header)
          : reqOperation;
      }
      const response = await reqOperation;

      // Assert
      expect(response.body.reqParams).toEqual(expected);
    }
  );
});
