import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import {
  JsonResponseMiddleware,
  ResponseFormatOptions,
} from '@vulcan-sql/serve/middleware';
import { Request, Response } from 'koa';
import { KoaRouterContext, MiddlewareConfig } from '@vulcan-sql/serve';
import * as json from '@vulcan-sql/serve/utils/response/json';

describe('Test json response format middleware', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Test to skip formatting json when enabled = false', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
    };

    const spy = sinon.default.spy(json.respondToJson);
    // Act
    const middleware = new JsonResponseMiddleware({
      'response-format': {
        enabled: false,
      },
    } as MiddlewareConfig);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(spy.notCalled).toBe(true);
  });

  it('Test to skip formatting json when enabled = true, but not "response-format" not include "json"', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
    };

    const spy = sinon.default.spy(json.respondToJson);
    // Act
    const middleware = new JsonResponseMiddleware({
      'response-format': {
        options: ['csv'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(spy.notCalled).toBe(true);
  });

  it('Test to skip formatting json when enabled = true, "response-format" include "json", and formatted by other middleware', async () => {
    // Arrange
    const stubRequest = sinon.stubInterface<Request>();
    stubRequest.url = faker.internet.url();

    const stubResponse = sinon.stubInterface<Response>();
    stubResponse.headers['X-Response-Formatted'] = 'true';

    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: stubRequest,
      response: stubResponse,
    };

    const spy = sinon.default.spy(json.respondToJson);
    // Act
    const middleware = new JsonResponseMiddleware({
      'response-format': {
        options: ['csv', 'json'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(spy.notCalled).toBe(true);
  });

  it('Test format success when enabled = true, "response-format" include "json", not yet formatted', async () => {
    // Arrange
    const stubRequest = sinon.stubInterface<Request>();
    stubRequest.url = faker.internet.url();

    const stubResponse = sinon.stubInterface<Response>();
    stubResponse.set.callsFake(() => null);

    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: stubRequest,
      response: stubResponse,
    };

    // Act
    const middleware = new JsonResponseMiddleware({
      'response-format': {
        options: ['csv', 'json'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);

    const stub = sinon.default
      .stub(json, 'respondToJson')
      .callsFake(() => null);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(stub.called).toBe(true);
  });

  it('Test format success when enabled = true, "response-format" include "json", request header "accept" contains "application/json"', async () => {
    // Arrange
    const stubRequest = sinon.stubInterface<Request>();
    stubRequest.accepts.returns('application/json');
    stubRequest.url = faker.internet.url();

    const stubResponse = sinon.stubInterface<Response>();
    stubResponse.set.callsFake(() => null);

    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: stubRequest,
      response: stubResponse,
    };

    // Act
    const middleware = new JsonResponseMiddleware({
      'response-format': {
        options: ['csv', 'json'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);

    const stub = sinon.default
      .stub(json, 'respondToJson')
      .callsFake(() => null);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(stub.called).toBe(true);
  });

  it('Test format success when enabled = true, "response-format" include "json", request url is end of ".json"', async () => {
    // Arrange
    const stubRequest = sinon.stubInterface<Request>();
    stubRequest.url = `${faker.internet.url()}.json`;

    const stubResponse = sinon.stubInterface<Response>();
    stubResponse.set.callsFake(() => null);

    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: stubRequest,
      response: stubResponse,
    };

    // Act
    const middleware = new JsonResponseMiddleware({
      'response-format': {
        options: ['csv', 'json'] as ResponseFormatOptions,
      },
    } as MiddlewareConfig);

    const stub = sinon.default
      .stub(json, 'respondToJson')
      .callsFake(() => null);

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(stub.called).toBe(true);
  });
});
