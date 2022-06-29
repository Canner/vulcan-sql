import * as sinon from 'ts-sinon';
import * as supertest from 'supertest';
import * as path from 'path';
import faker from '@faker-js/faker';
import { Request } from 'koa';
import * as KoaRouter from 'koa-router';
import { VulcanApplication } from '@app';
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
} from '@route/.';
import { PaginationTransformer } from '@route/.';

describe('Test vulcan server for practicing middleware', () => {
  let generator: RouteGenerator;
  let stubTemplateEngine: sinon.StubbedInstance<TemplateEngine>;

  beforeEach(() => {
    stubTemplateEngine = sinon.stubInterface<TemplateEngine>();

    const reqTransformer = new RequestTransformer();
    const reqValidator = new RequestValidator(new ValidatorLoader());
    const paginationTransformer = new PaginationTransformer();

    generator = new RouteGenerator({
      reqTransformer,
      reqValidator,
      paginationTransformer,
      templateEngine: stubTemplateEngine,
    });
  });
  it('Should show test middleware info when given middleware extension path', async () => {
    // Arrange
    const fakeSchema = {
      ...sinon.stubInterface<APISchema>(),
      urlPath: '/' + faker.internet.domainName(),
      request: [],
    } as APISchema;

    const app = new VulcanApplication({
      config: {
        middlewares: {
          'test-mode': {
            mode: true,
          },
        },
        extension: path.resolve(
          __dirname,
          './middlewares/test-custom-middlewares'
        ),
      },
      generator,
    });
    const server = await app.run({
      apiTypes: [APIProviderType.RESTFUL],
      schemas: [fakeSchema],
      port: 3000,
    });

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
  let generator: RouteGenerator;
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
    stubTemplateEngine = sinon.stubInterface<TemplateEngine>();

    const reqTransformer = new RequestTransformer();
    const reqValidator = new RequestValidator(new ValidatorLoader());
    const paginationTransformer = new PaginationTransformer();

    generator = new RouteGenerator({
      reqTransformer,
      reqValidator,
      paginationTransformer,
      templateEngine: stubTemplateEngine,
    });
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
      const app = new VulcanApplication({ config: {}, generator });
      const server = await app.run({
        apiTypes: [APIProviderType.RESTFUL],
        schemas: [schema],
        port: 3000,
      });
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
