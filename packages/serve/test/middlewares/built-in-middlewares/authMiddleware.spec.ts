import * as sinon from 'ts-sinon';
import { Container } from 'inversify';
import { AuthMiddleware } from '@vulcan-sql/serve/middleware';
import {
  AuthResult,
  AuthUserInfo,
  KoaContext,
  UserAuthOptions,
} from '@vulcan-sql/serve/models';
import { Request } from 'koa';
import { IncomingHttpHeaders } from 'http';
import * as lodash from 'lodash';

import { BasicAuthenticator } from '@vulcan-sql/serve';

describe('Test auth middlewares', () => {
  let stubBasicAuthenticator: sinon.StubbedInstance<BasicAuthenticator>;

  beforeEach(() => {
    stubBasicAuthenticator = sinon.stubInterface<BasicAuthenticator>();
  });

  afterEach(() => {
    sinon.default.restore();
  });

  it('Should return to stop auth middleware when enabled = false', async () => {
    // Arrange
    const ctx: KoaContext = {
      ...sinon.stubInterface<KoaContext>(),
    };
    // Act
    const middleware = new AuthMiddleware(
      {
        enabled: false,
      },
      '',
      []
    );
    // spy the async function to do test
    const spy = jest.spyOn(lodash, 'isEmpty');

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(spy).not.toHaveBeenCalled();
  });

  it.each([[[]], [undefined]])(
    'Should return to stop auth middleware when "user-auth" = %p in options',
    async (options) => {
      // Arrange
      const ctx: KoaContext = {
        ...sinon.stubInterface<KoaContext>(),
      };
      // Act
      const middleware = new AuthMiddleware(
        {
          options: {
            'user-auth': options,
          },
        },
        '',
        []
      );

      // spy the async function to do test
      const spy = jest.spyOn(lodash, 'isEmpty');

      await middleware.handle(ctx, async () => Promise.resolve());

      expect(spy).toHaveBeenCalled();
    }
  );

  it('Should authenticate successful when request with basic authorization and match in "user-auth" config', async () => {
    // Arrange
    const user = {
      name: 'user',
      auth: {
        method: 'basic',
        token: `${Buffer.from('user').toString('base64')}`,
      },
      attr: {
        role: 'engineer',
      },
    } as UserAuthOptions;

    // stub authenticate result
    stubBasicAuthenticator.authenticate.resolves({
      authenticated: true,
      user: {
        name: user.name,
        method: user.auth.method,
        attr: user.attr,
      },
    } as AuthResult);

    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `Basic ${user.auth['token']}`,
        },
      },
      state: {
        ...sinon.stubInterface<{ user: AuthUserInfo }>(),
      },
    };

    const expected = {
      name: user.name,
      method: user.auth.method,
      attr: user.attr,
    } as AuthUserInfo;
    // Act
    const middleware = new AuthMiddleware(
      {
        options: {
          ['user-auth']: [user],
        },
      },
      '',
      [stubBasicAuthenticator]
    );

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(ctx.state.user).toEqual(expected);
  });

  it('Should authenticate failed when request with basic authorization and not match in "user-auth" config', async () => {
    // Arrange
    const user = {
      name: 'user',
      auth: {
        method: 'basic',
        token: `${Buffer.from('user').toString('base64')}`,
      },
      attr: {
        role: 'engineer',
      },
    } as UserAuthOptions;

    // stub authenticate result
    stubBasicAuthenticator.authenticate.resolves({
      authenticated: false,
    } as AuthResult);

    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `Bear ${user.auth['token']}`,
        },
      },
      state: {
        ...sinon.stubInterface<{ user: AuthUserInfo }>(),
      },
    };
    const expected = new Error('authentication failed.');
    // Act
    const middleware = new AuthMiddleware(
      {
        options: {
          ['user-auth']: [user],
        },
      },
      '',
      [stubBasicAuthenticator]
    );
    const handleAction = middleware.handle(ctx, async () => Promise.resolve());
    // Assert
    expect(handleAction).rejects.toThrowError(expected);
  });
});
