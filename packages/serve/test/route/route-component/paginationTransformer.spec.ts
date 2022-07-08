import * as sinon from 'ts-sinon';
import { Request } from 'koa';
import faker from '@faker-js/faker';
import { APISchema, normalizeStringValue, PaginationMode } from '@vulcan/core';
import {
  IPaginationTransformer,
  KoaRouterContext,
  PaginationTransformer,
} from '@vulcan/serve/route';
import { Container } from 'inversify';
import { TYPES } from '@vulcan/serve/containers';

describe('Test pagination transformer - transform successfully', () => {
  let container: Container;

  const fakeSchemas: Array<APISchema> = [
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}`,
      // the pagination no need to set request schema
      request: [],
      pagination: {
        mode: PaginationMode.OFFSET,
      },
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}`,
      // the pagination no need to set request schema
      request: [],
      pagination: {
        mode: PaginationMode.CURSOR,
      },
    },
    {
      ...sinon.stubInterface<APISchema>(),
      urlPath: `/${faker.word.noun()}`,
      // the pagination no need to set request schema
      request: [],
      pagination: {
        mode: PaginationMode.KEYSET,
        keyName: 'createDate',
      },
    },
  ];
  const fakeKoaContexts: Array<KoaRouterContext> = [
    {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          limit: faker.datatype.number({ max: 100 }).toString(),
          offset: faker.datatype.number({ max: 100 }).toString(),
        },
      },
    },
    {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          limit: faker.datatype.number({ max: 100 }).toString(),
          cursor: faker.datatype.number({ max: 100 }).toString(),
        },
      },
    },
    {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          limit: faker.datatype.number({ max: 100 }).toString(),
          createDate: faker.date.recent().toISOString(),
        },
      },
    },
  ];

  beforeEach(() => {
    container = new Container();
    container.bind(TYPES.IPaginationTransformer).to(PaginationTransformer);
  });

  afterEach(() => {
    container.unbindAll();
  });

  it.each([
    ['offset pagination', fakeSchemas[0], fakeKoaContexts[0]],
    ['cursor pagination', fakeSchemas[1], fakeKoaContexts[1]],
    ['keyset pagination', fakeSchemas[2], fakeKoaContexts[2]],
  ])(
    'Should success when give api schema and koa context request from %p',
    async (_: string, schema: APISchema, ctx: KoaRouterContext) => {
      // Arrange
      let expected = {};
      const query = ctx.request.query;
      const limit = query['limit'] as string;

      if (schema.pagination?.mode === PaginationMode.OFFSET) {
        const offset = query['offset'] as string;
        expected = {
          limit: normalizeStringValue(limit, 'limit', Number.name),
          offset: normalizeStringValue(offset, 'offset', Number.name),
        };
      } else if (schema.pagination?.mode === PaginationMode.CURSOR) {
        const cursor = query['cursor'] as string;
        expected = {
          limit: normalizeStringValue(limit, 'limit', Number.name),
          cursor: normalizeStringValue(cursor, 'cursor', String.name),
        };
      } else if (schema.pagination?.mode === PaginationMode.KEYSET) {
        if (schema.pagination.keyName) {
          const { keyName } = schema.pagination;
          const keyNameVal = query[keyName] as string;
          expected = {
            limit: normalizeStringValue(limit, 'limit', Number.name),
            [keyName]: normalizeStringValue(keyNameVal, keyName, String.name),
          };
        }
      }
      // Act
      const transformer = container.get<IPaginationTransformer>(
        TYPES.IPaginationTransformer
      );
      const result = await transformer.transform(ctx, schema);

      // Assert
      expect(result).toEqual(expected);
    }
  );
});

// TODO: Failed case for transformer
