import * as sinon from 'ts-sinon';
import * as supertest from 'supertest';
import * as path from 'path';
import faker from '@faker-js/faker';
import { Request } from 'koa';
import * as KoaRouter from 'koa-router';
import * as http from 'http';
import {
  APISchema,
  FieldDataType,
  FieldInType,
  RequestSchema,
  TemplateEngine,
  ValidatorDefinition,
  ValidatorLoader,
  extensionModule as coreExtensionModule,
  TYPES as CORE_TYPES,
  DataSource,
  DocumentOptions,
} from '@vulcan-sql/core';
import {
  RouteGenerator,
  RequestParameters,
  RequestTransformer,
  RequestValidator,
  PaginationTransformer,
} from '@vulcan-sql/serve/route';
import { VulcanApplication } from '@vulcan-sql/serve/app';
import { KoaContext } from '@vulcan-sql/serve/models';
import { Container } from 'inversify';
import { extensionModule } from '../src/containers/modules';
import { TYPES } from '@vulcan-sql/serve';

describe('Test vulcan server for practicing middleware', () => {
  let container: Container;
  let stubTemplateEngine: sinon.StubbedInstance<TemplateEngine>;
  let stubDataSource: sinon.StubbedInstance<DataSource>;
  beforeEach(async () => {
    container = new Container();
    stubTemplateEngine = sinon.stubInterface<TemplateEngine>();
    stubDataSource = sinon.stubInterface<DataSource>();

    await container.loadAsync(
      coreExtensionModule({
        artifact: {} as any,
        template: {} as any,
        extensions: {
          test: path.resolve(
            __dirname,
            './middlewares/test-custom-middlewares'
          ),
        },
        test: {
          mode: true,
        },
      })
    );
    await container.loadAsync(extensionModule({} as any));

    container.bind(CORE_TYPES.ValidatorLoader).to(ValidatorLoader);
    container.bind(TYPES.PaginationTransformer).to(PaginationTransformer);
    container.bind(TYPES.RequestTransformer).to(RequestTransformer);
    container.bind(TYPES.RequestValidator).to(RequestValidator);
    container.bind(CORE_TYPES.DataSource).toConstantValue(stubDataSource);
    container
      .bind(CORE_TYPES.TemplateEngine)
      .toConstantValue(stubTemplateEngine);
    container.bind(TYPES.RouteGenerator).to(RouteGenerator);
    container.bind(TYPES.VulcanApplication).to(VulcanApplication);
    container.bind(TYPES.Factory_DocumentRouter).toConstantValue(() => null);
    container.bind(CORE_TYPES.DocumentOptions).toDynamicValue(
      () =>
        new DocumentOptions({
          router: [],
        })
    );
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

    const app = container.get<VulcanApplication>(TYPES.VulcanApplication);
    await app.useMiddleware();
    await app.buildRoutes([fakeSchema]);
    const server = http
      .createServer(app.getHandler())
      .listen(faker.datatype.number({ min: 20000, max: 30000 }));

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
  let stubDataSource: sinon.StubbedInstance<DataSource>;
  let server: http.Server;
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

  const fakeKoaContexts: Array<KoaContext> = [
    {
      ...sinon.stubInterface<KoaContext>(),
      params: {
        id: faker.datatype.number().toString(),
        uuid: faker.datatype.uuid(),
      },
    },
    {
      ...sinon.stubInterface<KoaContext>(),
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
      ...sinon.stubInterface<KoaContext>(),
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
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          keywords: faker.random.words(),
        },
      },
    },
  ];

  beforeEach(async () => {
    container = new Container();
    stubTemplateEngine = sinon.stubInterface<TemplateEngine>();
    stubDataSource = sinon.stubInterface<DataSource>();

    stubTemplateEngine.execute.callsFake(async (_: string, data: any) => {
      return {
        getData: () => data.context.params,
        getColumns: () => [],
      };
    });

    await container.loadAsync(
      coreExtensionModule({
        artifact: {} as any,
        template: {} as any,
      })
    );
    await container.loadAsync(
      extensionModule({
        'enforce-https': {
          enabled: false,
        },
        'response-format': {
          enabled: false,
        },
      } as any)
    );

    container.bind(CORE_TYPES.ValidatorLoader).to(ValidatorLoader);
    container.bind(TYPES.PaginationTransformer).to(PaginationTransformer);
    container.bind(TYPES.RequestTransformer).to(RequestTransformer);
    container.bind(TYPES.RequestValidator).to(RequestValidator);
    container.bind(CORE_TYPES.DataSource).toConstantValue(stubDataSource);
    container
      .bind(CORE_TYPES.TemplateEngine)
      .toConstantValue(stubTemplateEngine);
    container.bind(TYPES.RouteGenerator).to(RouteGenerator);
    container.bind(TYPES.VulcanApplication).to(VulcanApplication);
    container.bind(TYPES.Factory_DocumentRouter).toConstantValue(() => null);
    container.bind(CORE_TYPES.DocumentOptions).toDynamicValue(
      () =>
        new DocumentOptions({
          router: [],
        })
    );
  });

  afterEach(() => {
    container.unbindAll();
    // close server
    server.close();
  });

  it.each([
    ['path nested parameters', fakeSchemas[0], fakeKoaContexts[0]],
    ['path & header parameters', fakeSchemas[1], fakeKoaContexts[1]],
    ['query & header parameters', fakeSchemas[2], fakeKoaContexts[2]],
    ['query parameters', fakeSchemas[3], fakeKoaContexts[3]],
  ])(
    'Should be correct when given validated koa context request from %p',
    async (_: string, schema: APISchema, ctx: KoaContext) => {
      // Arrange, close response format middlewares to make expected work.
      const app = container.get<VulcanApplication>(TYPES.VulcanApplication);
      await app.useMiddleware();
      await app.buildRoutes([schema]);
      server = http
        .createServer(app.getHandler())
        .listen(faker.datatype.number({ min: 20000, max: 30000 }));

      // arrange input api url
      const apiUrl = KoaRouter.url('/api' + schema.urlPath, ctx.params);

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

      stubTemplateEngine.execute.resolves({
        getData: () => expected as any,
        getColumns: () => [],
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
      expect(response.body.data).toEqual(expected);
    }
  );
});
