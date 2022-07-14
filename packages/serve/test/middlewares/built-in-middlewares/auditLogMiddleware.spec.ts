import faker from '@faker-js/faker';
import * as sinon from 'ts-sinon';
import { Request, Response } from 'koa';
import { IncomingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { KoaRouterContext } from '@vulcan/serve/route';
import {
  AuditLoggingMiddleware,
  RequestIdMiddleware,
} from '@vulcan/serve/middleware';
import * as core from '@vulcan/core';
import * as uuid from 'uuid';
import { LoggerOptions } from '@vulcan/core';

describe('Test audit logging middlewares', () => {
  afterEach(() => {
    sinon.default.restore();
  });
  it('Should log correct info when when option is default and pass correct koa context', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      path: faker.internet.url(),
      params: {
        uuid: faker.datatype.uuid(),
      },
      request: {
        ...sinon.stubInterface<Request>(),
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
        body: {
          result: 'OK',
        },
      },
    };
    const expected = [
      `request: path = ${ctx.path}`,
      `request: header = ${JSON.stringify(ctx.request.header)}`,
      `request: query = ${JSON.stringify(ctx.request.query)}`,
      `request: params = ${JSON.stringify(ctx.params)}.`,
      `response: body = ${JSON.stringify(ctx.response.body)}`,
    ];
    // Act
    const middleware = new AuditLoggingMiddleware({});
    // Use spy to trace the logger from getLogger( scopeName: 'AUDIT' }) to know in logger.info(...)
    const spy = sinon.default.spy(core.getLogger({ scopeName: 'AUDIT' }));
    await middleware.handle(ctx, async () => Promise.resolve());

    // Assert
    expect(spy.info.getCall(0).args[0]).toEqual(expected[0]);
    expect(spy.info.getCall(1).args[0]).toEqual(expected[1]);
    expect(spy.info.getCall(2).args[0]).toEqual(expected[2]);
    expect(spy.info.getCall(3).args[0]).toEqual(expected[3]);
    expect(spy.info.getCall(4).args[0]).toEqual(expected[4]);
  });

  it('Should log correct info when when option "displayRequestId: true" and pass correct koa context', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      path: faker.internet.url(),
      params: {
        uuid: faker.datatype.uuid(),
      },
      request: {
        ...sinon.stubInterface<Request>(),
        header: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          'X-Agent': 'test-school-client',
        },
        query: {
          ...sinon.stubInterface<ParsedUrlQuery>(),
          sortby: 'score',
        },
      },
      response: {
        ...sinon.stubInterface<Response>(),
        body: {
          result: 'Success',
        },
      },
    };

    const expected = {
      requestId: uuid.v4(),
      info: [
        `request: path = ${ctx.path}`,
        `request: header = ${JSON.stringify(ctx.request.header)}`,
        `request: query = ${JSON.stringify(ctx.request.query)}`,
        `request: params = ${JSON.stringify(ctx.params)}.`,
        `response: body = ${JSON.stringify(ctx.response.body)}`,
      ],
    };

    // setup request-id middleware run first.
    const stubReqIdMiddleware = new RequestIdMiddleware({});
    const middleware = new AuditLoggingMiddleware({
      'audit-log': {
        options: {
          displayRequestId: true,
        } as LoggerOptions,
      },
    });
    // Use spy to trace the logger from getLogger( scopeName: 'AUDIT' }) to know in logger.info(...)
    // it will get the setting of logger from above new audit logging middleware
    const spy = sinon.default.spy(
      core.getLogger({
        scopeName: 'AUDIT',
      })
    );
    // Act
    const next = () => middleware.handle(ctx, async () => Promise.resolve());
    await stubReqIdMiddleware.handle(ctx, next);

    // Assert
    // check logger.info message
    expect(spy.info.getCall(0).args[0]).toEqual(expected.info[0]);
    expect(spy.info.getCall(1).args[0]).toEqual(expected.info[1]);
    expect(spy.info.getCall(2).args[0]).toEqual(expected.info[2]);
    expect(spy.info.getCall(3).args[0]).toEqual(expected.info[3]);
    expect(spy.info.getCall(4).args[0]).toEqual(expected.info[4]);
    // check request id
    expect(spy.info.returnValues[0].requestId).toEqual(expected.requestId);
    expect(spy.info.returnValues[1].requestId).toEqual(expected.requestId);
    expect(spy.info.returnValues[2].requestId).toEqual(expected.requestId);
    expect(spy.info.returnValues[3].requestId).toEqual(expected.requestId);
    expect(spy.info.returnValues[4].requestId).toEqual(expected.requestId);
  });
});
