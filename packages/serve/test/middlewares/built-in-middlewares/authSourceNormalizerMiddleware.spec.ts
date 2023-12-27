import * as sinon from 'ts-sinon';
import { isBase64 } from 'class-validator';
import { Request } from 'koa';
import { IncomingHttpHeaders } from 'http';
import { AuthSourceNormalizerMiddleware } from '@vulcan-sql/serve/middleware';
import { AuthSourceTypes, KoaContext } from '@vulcan-sql/serve/models';
import { ProjectOptions } from '@vulcan-sql/api-layer';

describe('Test auth source normalizer middleware', () => {
  afterEach(() => {
    sinon.default.restore();
  });
  it('Should throw error when "in" field of middleware options value not supported.', async () => {
    // Arrange
    const expected = new Error(
      `The "header" not support, only supported: ${Object.keys(
        AuthSourceTypes
      )}`
    );
    const middleware = new AuthSourceNormalizerMiddleware(
      {
        options: {
          in: 'header',
        },
      },
      '',
      new ProjectOptions()
    );
    // Act
    const activateFunc = async () => await middleware.activate();
    // Assert
    expect(activateFunc).rejects.toThrow(expected);
  });

  it('Should not called successful when enabled = false of options in middleware.', async () => {
    // Arrange
    const context = {
      ...sinon.stubInterface<KoaContext>(),
    };
    const middleware = new AuthSourceNormalizerMiddleware(
      {
        enabled: false,
      },
      '',
      new ProjectOptions()
    );
    await middleware.activate();
    const spy = sinon.default.spy(isBase64);

    // Act
    await middleware.handle(context, async () => Promise.resolve());
    // Assert
    expect(spy.notCalled).toBeTruthy();
  });

  it('Should not called successful when context.path is "/auth/token" to middleware.', async () => {
    // Arrange
    const context = {
      ...sinon.stubInterface<KoaContext>(),
      path: '/auth/token',
      request: {
        ...sinon.stubInterface<Request>(),
        query: {},
        body: {},
      },
    };
    const middleware = new AuthSourceNormalizerMiddleware(
      {},
      '',
      new ProjectOptions()
    );
    await middleware.activate();
    const spy = sinon.default.spy(isBase64);

    // Act
    await middleware.handle(context, async () => Promise.resolve());
    // Assert
    expect(spy.notCalled).toBeTruthy();
  });

  it('Should success when using default options and run middleware.', async () => {
    // Arrange
    const expected = `Basic ${Buffer.from('user1:test1').toString('base64')}`;
    const authInput = Buffer.from(
      JSON.stringify({
        Authorization: expected,
      })
    ).toString('base64');

    const context = {
      ...sinon.stubInterface<KoaContext>(),
      path: '/auth/user-profile',
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          auth: authInput,
        },
        body: {},
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
        },
      },
    };
    const middleware = new AuthSourceNormalizerMiddleware(
      {},
      '',
      new ProjectOptions()
    );
    await middleware.activate();

    // Act
    await middleware.handle(context, async () => Promise.resolve());
    // Assert
    expect(context.request.headers.authorization).toEqual(expected);
  });

  it('Should success when setting "key" field to "x-auth" in options and run middleware.', async () => {
    // Arrange
    const expected = `Basic ${Buffer.from('user1:test1').toString('base64')}`;
    const authInput = Buffer.from(
      JSON.stringify({
        Authorization: expected,
      })
    ).toString('base64');

    const context = {
      ...sinon.stubInterface<KoaContext>(),
      path: '/auth/user-profile',
      request: {
        ...sinon.stubInterface<Request>(),
        query: {
          ['x-auth']: authInput,
        },
        body: {},
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
        },
      },
    };
    const middleware = new AuthSourceNormalizerMiddleware(
      {
        options: {
          key: 'x-auth',
        },
      },
      '',
      new ProjectOptions()
    );
    await middleware.activate();

    // Act
    await middleware.handle(context, async () => Promise.resolve());
    // Assert
    expect(context.request.headers.authorization).toEqual(expected);
  });

  it('Should success when setting "in" field to "payload" in options and run middleware.', async () => {
    // Arrange
    const expected = `Basic ${Buffer.from('user1:test1').toString('base64')}`;
    const authInput = Buffer.from(
      JSON.stringify({
        Authorization: expected,
      })
    ).toString('base64');

    const context = {
      ...sinon.stubInterface<KoaContext>(),
      path: '/auth/user-profile',
      request: {
        ...sinon.stubInterface<Request>(),
        query: {},
        body: {
          auth: authInput,
        },
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
        },
      },
    };
    const middleware = new AuthSourceNormalizerMiddleware(
      {
        options: {
          in: 'payload',
        },
      },
      '',
      new ProjectOptions()
    );
    await middleware.activate();

    // Act
    await middleware.handle(context, async () => Promise.resolve());
    // Assert
    expect(context.request.headers.authorization).toEqual(expected);
  });
});
