import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import {
  CsvResponseMiddleware,
  ResponseFormatOptions,
} from '@vulcan-sql/serve/middleware';
import { Request, Response } from 'koa';
import { KoaRouterContext, MiddlewareConfig } from '@vulcan-sql/serve';
import * as csv from '@vulcan-sql/serve/utils/response/csv';

describe('Test csv response format middleware', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Test to skip formatting csv when enabled = false', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
    };

    const spy = sinon.default.spy(csv.respondToCsv);
    // Act
    const middleware = new CsvResponseMiddleware({
      'response-format': {
        enabled: false,
      },
    } as MiddlewareConfig);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(spy.notCalled).toBe(true);
  });

  it('Test to skip formatting csv when enabled = true, but not "response-format" not include "csv"', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
    };

    const spy = sinon.default.spy(csv.respondToCsv);
    // Act
    const middleware = new CsvResponseMiddleware({
      'response-format': {
        options: ['json'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(spy.notCalled).toBe(true);
  });

  it('Test to skip formatting csv when enabled = true, "response-format" include "csv", but request not require format to csv', async () => {
    // Arrange
    const stubRequest = sinon.stubInterface<Request>();
    stubRequest.accepts.returns(false);
    stubRequest.url = faker.internet.url();

    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: stubRequest,
    };

    const spy = sinon.default.spy(csv.respondToCsv);
    // Act
    const middleware = new CsvResponseMiddleware({
      'response-format': {
        options: ['csv', 'json'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);
    await middleware.handle(ctx, async () => Promise.resolve());

    expect(spy.notCalled).toBe(true);
  });

  it('Test format success when enabled = true, "response-format" include "csv", request header "accept" contains "text/csv"', async () => {
    // Arrange
    const stubRequest = sinon.stubInterface<Request>();
    stubRequest.accepts.returns('text/csv');
    stubRequest.url = faker.internet.url();

    const stubResponse = sinon.stubInterface<Response>();
    stubResponse.set.callsFake(() => null);

    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: stubRequest,
      response: stubResponse,
    };

    const stub = sinon.default.stub(csv, 'respondToCsv').callsFake(() => null);
    // Act
    const middleware = new CsvResponseMiddleware({
      'response-format': {
        options: ['csv', 'json'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(stub.called).toBe(true);
  });

  it('Test to skip formatting csv when enabled = true, "response-format" include "csv", request header "accept" contains "text/csv", but url end of .json', async () => {
    // Arrange
    const stubRequest = sinon.stubInterface<Request>();
    stubRequest.accepts.returns('text/csv');
    stubRequest.url = `${faker.internet.url()}.json`;

    const stubResponse = sinon.stubInterface<Response>();
    stubResponse.set.callsFake(() => null);

    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: stubRequest,
      response: stubResponse,
    };

    const stub = sinon.default.stub(csv, 'respondToCsv').callsFake(() => null);
    // Act
    const middleware = new CsvResponseMiddleware({
      'response-format': {
        options: ['csv', 'json'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(stub.notCalled).toBe(true);
  });

  it('Test format success when enabled = true, "response-format" include "csv", request url is end of ".csv"', async () => {
    // Arrange
    const stubRequest = sinon.stubInterface<Request>();
    stubRequest.url = `${faker.internet.url()}.csv`;

    const stubResponse = sinon.stubInterface<Response>();
    stubResponse.set.callsFake(() => null);

    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: stubRequest,
      response: stubResponse,
    };

    // Act
    const middleware = new CsvResponseMiddleware({
      'response-format': {
        options: ['csv', 'json'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);

    const stub = sinon.default.stub(csv, 'respondToCsv').callsFake(() => null);
    await middleware.handle(ctx, async () => Promise.resolve());

    expect(stub.called).toBe(true);
  });
});
