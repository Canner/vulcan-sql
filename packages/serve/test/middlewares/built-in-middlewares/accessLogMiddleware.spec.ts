import faker from '@faker-js/faker';
import * as sinon from 'ts-sinon';
import { Request, Response } from 'koa';
import { IncomingHttpHeaders } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { KoaContext } from '@vulcan-sql/serve/models';
import * as core from '@vulcan-sql/core';
import * as uuid from 'uuid';
import {
  AccessLogMiddleware,
  RequestIdMiddleware,
} from '@vulcan-sql/serve/middleware';
import bytes = require('bytes');

describe('Test access log middlewares', () => {
  afterEach(() => {
    sinon.default.restore();
  });
  it('Should log correct info when when option is default and pass correct koa context', async () => {
    // Arrange
    const ctx: KoaContext = {
      ...sinon.stubInterface<KoaContext>(),

      params: {
        uuid: faker.datatype.uuid(),
      },
      request: {
        ...sinon.stubInterface<Request>(),
        ip: faker.internet.ip(),
        method: faker.internet.httpMethod(),
        path: faker.internet.url(),
        length: faker.datatype.number({ min: 100, max: 100000 }),
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
    const { request: req, response: resp } = ctx;

    const expected = [
      `--> ${req.ip} -- "${req.method} ${req.path}" -- size: ${
        req.length ? bytes(req.length).toLowerCase() : 'none'
      }`,
      ` -> header: ${JSON.stringify(req.header)}`,
      ` -> query: ${JSON.stringify(req.query)}`,
      ` -> params: ${JSON.stringify(ctx.params)}`,
      `<-- status: ${resp.status} -- size: ${
        resp.length ? bytes(resp.length).toLowerCase() : 'none'
      }`,
      ` <- header: ${JSON.stringify(resp.header)}`,
    ];
    // Act
    const middleware = new AccessLogMiddleware({}, '');
    // Use spy to trace the logger from getLogger( scopeName: 'ACCESS_LOG' }) to know in logger.info(...)
    const spy = sinon.default.spy(core.getLogger({ scopeName: 'ACCESS_LOG' }));
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
    const ctx: KoaContext = {
      ...sinon.stubInterface<KoaContext>(),
      params: {
        uuid: faker.datatype.uuid(),
      },
      request: {
        ...sinon.stubInterface<Request>(),
        ip: faker.internet.ip(),
        method: faker.internet.httpMethod(),
        path: faker.internet.url(),
        length: faker.datatype.number({ min: 100, max: 100000 }),
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
        length: faker.datatype.number({ min: 100, max: 100000 }),
        status: 200,
        body: {
          result: 'Success',
        },
      },
    };

    const { request: req, response: resp } = ctx;

    const expected = {
      requestId: uuid.v4(),
      info: [
        `--> ${req.ip} -- "${req.method} ${req.path}" -- size: ${
          req.length ? bytes(req.length).toLowerCase() : 'none'
        }`,
        ` -> header: ${JSON.stringify(req.header)}`,
        ` -> query: ${JSON.stringify(req.query)}`,
        ` -> params: ${JSON.stringify(ctx.params)}`,
        `<-- status: ${resp.status} -- size: ${
          resp.length ? bytes(resp.length).toLowerCase() : 'none'
        }`,
        ` <- header: ${JSON.stringify(resp.header)}`,
      ],
    };

    // setup request-id middleware run first.
    const stubReqIdMiddleware = new RequestIdMiddleware({}, '');
    const middleware = new AccessLogMiddleware(
      {
        options: {
          displayRequestId: true,
        },
      },
      ''
    );
    // Use spy to trace the logger from getLogger( scopeName: 'ACCESS_LOG' }) to know in logger.info(...)
    // it will get the setting of logger from above new ACCESS_LOG logging middleware
    const spy = sinon.default.spy(
      core.getLogger({
        scopeName: 'ACCESS_LOG',
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
