import * as sinon from 'ts-sinon';
import * as supertest from 'supertest';
import * as path from 'path';
import faker from '@faker-js/faker';
import { Request } from 'koa';
import * as KoaRouter from 'koa-router';
import * as http from 'http';
import { VulcanApplication } from '@vulcan/serve/app';
import {
  APISchema,
  FieldDataType,
  FieldInType,
  RequestSchema,
  TemplateEngine,
  ValidatorDefinition,
  ValidatorLoader,
} from '@vulcan/core';
import {
  RouteGenerator,
  APIProviderType,
  KoaRouterContext,
  RequestParameters,
  RequestTransformer,
  RequestValidator,
  PaginationTransformer,
} from '@vulcan/serve/route';
import { Container } from 'inversify';
import { TYPES as CORE_TYPES } from '@vulcan/core/containers';
import { TYPES } from '../src/containers/types';

describe('Test vulcan server for practicing middleware', () => {
  let container: Container;
  let stubTemplateEngine: sinon.StubbedInstance<TemplateEngine>;
  beforeEach(() => {
    container = new Container();
    stubTemplateEngine = sinon.stubInterface<TemplateEngine>();

    container.bind(CORE_TYPES.ValidatorLoader).to(ValidatorLoader);
    container.bind(TYPES.PaginationTransformer).to(PaginationTransformer);
    container.bind(TYPES.RequestTransformer).to(RequestTransformer);
    container.bind(TYPES.RequestValidator).to(RequestValidator);
    container
      .bind(CORE_TYPES.TemplateEngine)
      .toConstantValue(stubTemplateEngine);
    container.bind(TYPES.RouteGenerator).to(RouteGenerator);
  });

  afterEach(() => {
    container.unbindAll();
  });
  it('Should show test middleware info when given middleware extension path', async () => {
    // Arrange
    const fakeSchema = {
      ...sinon.stubInterface<APISchema>(),
      urlPath: '/' + faker.internet.domainName(),
      request: [],
    } as APISchema;

    const app = new VulcanApplication(
      {
        middlewares: {
          'test-mode': {
            mode: true,
          },
        },
        extensions: [
          path.resolve(__dirname, './middlewares/test-custom-middlewares'),
        ],
      },
      container.get<RouteGenerator>(TYPES.RouteGenerator)
    );
    await app.buildMiddleware();
    await app.buildRoutes([fakeSchema], [APIProviderType.RESTFUL]);

    const server = http
      .createServer(app.getHandler())
      .listen(faker.internet.port());

    // arrange expected result
    const expected = {
      'test-mode': 'true',
    };

    // Act
    const reqOperation = supertest(server).get(fakeSchema.urlPath);

    const response = await reqOperation;
    // Assert
    expect(response.headers).toEqual(expect.objectContaining(expected));

    // close server
    server.close();
  });
});

describe('Test vulcan server for calling restful APIs', () => {
  let container: Container;
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

  beforeEach(() => {
    container = new Container();
    stubTemplateEngine = sinon.stubInterface<TemplateEngine>();

    container.bind(CORE_TYPES.ValidatorLoader).to(ValidatorLoader);
    container.bind(TYPES.PaginationTransformer).to(PaginationTransformer);
    container.bind(TYPES.RequestTransformer).to(RequestTransformer);
    container.bind(TYPES.RequestValidator).to(RequestValidator);
    container
      .bind(CORE_TYPES.TemplateEngine)
      .toConstantValue(stubTemplateEngine);
    container.bind(TYPES.RouteGenerator).to(RouteGenerator);
  });

  afterEach(() => {
    container.unbindAll();
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
      const app = new VulcanApplication(
        {},
        container.get<RouteGenerator>(TYPES.RouteGenerator)
      );
      await app.buildMiddleware();
      await app.buildRoutes([schema], [APIProviderType.RESTFUL]);
      const server = http
        .createServer(app.getHandler())
        .listen(faker.internet.port());

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
      // close server
      server.close();
    }
  );
});
