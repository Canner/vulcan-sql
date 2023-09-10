import faker from '@faker-js/faker';
import * as sinon from 'ts-sinon';
import { Request, Response } from 'koa';
import { IncomingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { KoaContext } from '@vulcan-sql/serve/models';

import { HttpLogger } from '../../../../core/src/lib/loggers/httpLogger';
import { ActivityLogMiddleware } from '@vulcan-sql/serve/middleware/activityLogMiddleware';

jest.mock('../../../../core/src/lib/loggers/httpLogger', () => {
  const originalModule = jest.requireActual(
    '../../../../core/src/lib/loggers/httpLogger'
  );
  return {
    ...originalModule,
    HttpLogger: jest.fn().mockImplementation(() => {
      return {
        getExtensionId: jest.fn().mockReturnValue('http-logger'),
        isEnabled: jest.fn().mockReturnValue(true),
        log: jest.fn().mockResolvedValue(true), // Spy on the add method
      };
    }),
  };
});
const extensionConfig = {
  enabled: true,
  options: { 'http-logger': { connection: { host: 'localhost' } } },
};
const mockLogger = new HttpLogger(extensionConfig, 'http-logger');

describe('Test activity log middlewares', () => {
  afterEach(() => {
    sinon.default.restore();
    jest.clearAllMocks();
  });
  it('Should log with correct info when response is status 200', async () => {
    // Arrange
    const ctx: KoaContext = {
      ...sinon.stubInterface<KoaContext>(),

      params: {
        uuid: faker.datatype.uuid(),
      },
      state: {
        user: {
          name: faker.name.firstName(),
          attr: {
            email: faker.internet.email(),
            id: faker.datatype.uuid(),
          },
        },
      },
      request: {
        ...sinon.stubInterface<Request>(),
        ip: faker.internet.ip(),
        method: faker.internet.httpMethod(),
        originalUrl: faker.internet.url(),
        header: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          'X-Agent': 'test-normal-client',
        },
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          sortby: 'name',
        },
      },
      response: {
        ...sinon.stubInterface<Response>(),
        status: 200,
        length: faker.datatype.number({ min: 100, max: 100000 }),
        body: {
          result: 'OK',
        },
      },
    };

    const expected = {
      method: ctx.request.method,
      url: ctx.request.originalUrl,
      status: ctx.response.status,
      headers: ctx.request.headers,
      error: undefined,
      ip: ctx.request.ip,
      params: ctx.params,
      user: ctx.state.user,
    };
    // Act
    const middleware = new ActivityLogMiddleware(extensionConfig, '', [
      mockLogger,
    ]);
    await middleware.activate();
    await middleware.handle(ctx, async () => Promise.resolve());

    // Assert
    const logMock = mockLogger.log as jest.Mock;
    const actual = logMock.mock.calls[0];
    expect(actual[0].method).toEqual(expected.method);
    expect(actual[0].url).toEqual(expected.url);
    expect(actual[0].status).toEqual(expected.status);
    expect(actual[0].headers).toEqual(expected.headers);
    expect(actual[0].ip).toEqual(expected.ip);
    expect(actual[0].params).toEqual(expected.params);
    expect(actual[0].error).toEqual(expected.error);
    expect(actual[0].user).toEqual(expected.user);
  });
  it('Should log with correct info when response is not status 200', async () => {
    // Arrange
    const ctx: KoaContext = {
      ...sinon.stubInterface<KoaContext>(),

      params: {
        uuid: faker.datatype.uuid(),
      },
      state: {
        user: {
          name: faker.name.firstName(),
          attr: {
            email: faker.internet.email(),
            id: faker.datatype.uuid(),
          },
        },
      },
      request: {
        ...sinon.stubInterface<Request>(),
        ip: faker.internet.ip(),
        method: faker.internet.httpMethod(),
        originalUrl: faker.internet.url(),
        header: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          'X-Agent': 'test-normal-client',
        },
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          sortby: 'name',
        },
      },
      response: {
        ...sinon.stubInterface<Response>(),
        status: 401,
        body: {
          message: 'Unauthorized',
          result: 'OK',
        },
      },
    };
    const body = ctx.response.body as any;
    const expected = {
      method: ctx.request.method,
      url: ctx.request.originalUrl,
      status: ctx.response.status,
      headers: ctx.request.headers,
      error: body.message,
      ip: ctx.request.ip,
      params: ctx.params,
      user: ctx.state.user,
    };
    // Act
    const middleware = new ActivityLogMiddleware(extensionConfig, '', [
      mockLogger,
    ]);
    await middleware.activate();
    await middleware.handle(ctx, async () => Promise.resolve());

    // Assert
    const logMock = mockLogger.log as jest.Mock;
    const actual = logMock.mock.calls[0];
    expect(actual[0].method).toEqual(expected.method);
    expect(actual[0].url).toEqual(expected.url);
    expect(actual[0].status).toEqual(expected.status);
    expect(actual[0].headers).toEqual(expected.headers);
    expect(actual[0].ip).toEqual(expected.ip);
    expect(actual[0].params).toEqual(expected.params);
    expect(actual[0].error).toEqual(expected.error);
    expect(actual[0].user).toEqual(expected.user);
  });
});
