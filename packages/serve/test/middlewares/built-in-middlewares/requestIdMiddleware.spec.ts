import faker from '@faker-js/faker';
import * as sinon from 'ts-sinon';
import { Request } from 'koa';
import { IncomingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { asyncReqIdStorage, FieldInType } from '@vulcan-sql/core';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import * as uuid from 'uuid';
import { RequestIdMiddleware } from '@vulcan-sql/serve/middleware';

describe('Test request-id middlewares', () => {
  afterEach(() => {
    // restore spying global object asyncReqIdStorage to un-spy.
    sinon.default.restore();
  });
  it('Should get same request-id when option is default and pass "x-request-id"', async () => {
    // Arrange
    const expected = faker.datatype.uuid();
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        header: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          // simulate koa context, it will transfer to lower case actual when sending request
          // https://medium.com/@andrelimamail/http-node-server-lower-casing-headers-365764218527
          'x-request-id': expected,
        },
      },
    };
    // spy the asyncReqIdStorage behavior
    const spy = sinon.default.spy(asyncReqIdStorage);
    // Act
    const middleware = new RequestIdMiddleware({}, '');
    await middleware.handle(ctx, async () => Promise.resolve());

    // Assert
    expect(spy.run.getCall(0).args[0].requestId).toEqual(expected);
  });

  it('Should get same request-id when setup option "Test-Request-ID" in query and pass "test-request-id"', async () => {
    // Arrange
    const expected = faker.datatype.uuid();
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          // simulate koa context, it will transfer to lower case actual when sending request
          // https://medium.com/@andrelimamail/http-node-server-lower-casing-headers-365764218527
          'test-request-id': expected,
        },
      },
    };
    // Act
    const middleware = new RequestIdMiddleware(
      {
        options: {
          name: 'Test-Request-ID',
          fieldIn: FieldInType.QUERY,
        },
      },
      ''
    );

    // spy the asyncReqIdStorage behavior
    const spy = sinon.default.spy(asyncReqIdStorage);
    await middleware.handle(ctx, async () => Promise.resolve());
    // Assert,
    expect(spy.run.getCall(0).args[0].requestId).toEqual(expected);
  });

  it('Should generate default request-id when setup option field in query', async () => {
    // Arrange
    // the uuid.v4() result is the mock result in __mocks__/uuid.ts
    const expected = uuid.v4();
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
        },
      },
    };
    // Act
    const middleware = new RequestIdMiddleware(
      {
        options: {
          fieldIn: FieldInType.QUERY,
        },
      },
      ''
    );

    // spy the asyncReqIdStorage behavior
    const spy = sinon.default.spy(asyncReqIdStorage);
    await middleware.handle(ctx, async () => Promise.resolve());
    // Assert
    expect(spy.run.getCall(0).args[0].requestId).toEqual(expected);
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

    // spy the asyncReqIdStorage behavior
    const spy = sinon.default.spy(asyncReqIdStorage);
    // Act
    const middleware = new RequestIdMiddleware({}, '');
    await middleware.handle(ctx, async () => Promise.resolve());

    // Assert,
    expect(spy.run.getCall(0).args[0].requestId).toEqual(expected);
  });
});
