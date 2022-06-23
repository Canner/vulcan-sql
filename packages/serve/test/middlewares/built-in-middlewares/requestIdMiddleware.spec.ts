import faker from '@faker-js/faker';
import * as sinon from 'ts-sinon';
import { Request } from 'koa';
import { IncomingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { asyncReqIdStorage, FieldInType } from '@vulcan/core';
import { KoaRouterContext } from '@route/route-component';
import {
  RequestIdMiddleware,
  RequestIdOptions,
} from '@middleware/built-in-middlewares';
import * as uuid from 'uuid';

describe('Test request-id middlewares', () => {
  it('Should get same request-id when option is default and pass X-Request-ID', async () => {
    // Arrange
    const expected = faker.datatype.uuid();
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        header: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          'X-Request-ID': expected,
        },
      },
    };
    // Act
    const middleware = new RequestIdMiddleware({});
    await middleware.handle(ctx, async () => Promise.resolve());
    const actual = asyncReqIdStorage.getStore()?.requestId;

    // Assert,
    expect(actual).toEqual(expected);
  });

  it('Should get same request-id when setup option "Test-Request-ID" in query and pass request-id', async () => {
    // Arrange
    const expected = faker.datatype.uuid();
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          'Test-Request-ID': expected,
        },
      },
    };
    // Act
    const middleware = new RequestIdMiddleware({
      middlewares: {
        'request-id': {
          name: 'Test-Request-ID',
          fieldIn: FieldInType.QUERY,
        } as RequestIdOptions,
      },
    });

    await middleware.handle(ctx, async () => Promise.resolve());
    const actual = asyncReqIdStorage.getStore()?.requestId;
    // Assert,
    expect(actual).toEqual(expected);
  });

  it('Should generate default request-id when request-id does not setup', async () => {
    // Arrange
    // the uuid.v4() result is the mock result in __mocks__/uuid.ts
    const expected = uuid.v4();
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        header: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
        },
      },
    };

    // Act
    const middleware = new RequestIdMiddleware({});

    await middleware.handle(ctx, async () => Promise.resolve());
    const actual = asyncReqIdStorage.getStore()?.requestId;

    // Assert,
    expect(actual).toEqual(expected);
  });
});
