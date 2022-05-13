import * as sinon from 'ts-sinon';
import { Request } from 'koa';
import faker from '@faker-js/faker';
import {
  APISchema,
  FieldDataType,
  FieldInType,
  RequestSchema,
} from '@vulcan/core';
import {
  KoaRouterContext,
  RequestParameters,
  RequestTransformer,
} from '@route-generator/.';

describe('Test request transformer - transform successfully', () => {
  const fakeSchemas: Array<APISchema> = [
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}/:id/${faker.word.noun()}/:uuid`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'id',
          type: FieldDataType.NUMBER,
          fieldIn: FieldInType.PATH,
        },
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'uuid',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.PATH,
        },
      ],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}/:uuid`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'uuid',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.PATH,
        },
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'domain',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.HEADER,
        },
      ],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'keywords',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.QUERY,
        },
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'domain',
          type: FieldDataType.STRING,
          fieldIn: FieldInType.HEADER,
        },
      ],
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}`,
      request: [
        {
          ...sinon.stubInterface<RequestSchema>(),
          fieldName: 'sort',
          type: FieldDataType.BOOLEAN,
          fieldIn: FieldInType.QUERY,
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
          sort: faker.datatype.string(),
        },
      },
    },
  ];

  it.each([
    ['path nested parameters', fakeSchemas[0], fakeKoaContexts[0]],
    ['path & header parameters', fakeSchemas[1], fakeKoaContexts[1]],
    ['query & header parameters', fakeSchemas[2], fakeKoaContexts[2]],
    ['query parameters', fakeSchemas[3], fakeKoaContexts[3]],
  ])(
    'Should success when give api schema and koa context request from %p',
    async (_: string, schema: APISchema, ctx: KoaRouterContext) => {
      // Arrange
      const expected: RequestParameters = {};
      schema.request.map((param: RequestSchema) => {
        const fieldValue = RequestTransformer.fieldInMapper[param.fieldIn](
          ctx,
          param.fieldName
        );
        expected[param.fieldName] =
          RequestTransformer.convertTypeMapper[param.type](fieldValue);
      });
      // Act
      const transformer = new RequestTransformer();
      const result = await transformer.transform(ctx, schema);

      // Assert
      expect(result).toEqual(expected);
    }
  );
});

// TODO: Failed case for transformer
