import * as sinon from 'ts-sinon';
import { AuthCredentialsMiddleware } from '@vulcan-sql/serve/middleware';
import {
  AuthResult,
  AuthStatus,
  AuthType,
  AuthUserInfo,
  KoaContext,
} from '@vulcan-sql/serve/models';
import * as lodash from 'lodash';
import {
  BasicAuthenticator,
  PasswordFileAuthenticator,
  SimpleTokenAuthenticator,
} from '@vulcan-sql/serve';
import { ProjectOptions } from '@vulcan-sql/core';
import { IncomingHttpHeaders } from 'http';
import { Request } from 'koa';

describe('Test auth credential middleware', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Should return to stop auth middleware when enabled = false', async () => {
    // Arrange
    const middleware = new AuthCredentialsMiddleware(
      {
        enabled: false,
      },
      '',
      [],
      new ProjectOptions()
    );
    // spy the async function to do test
    const spy = jest.spyOn(lodash, 'isEmpty');

    // Act
    await middleware.activate();

    expect(spy).not.toHaveBeenCalled();
  });

  it.each([
    ['basic', sinon.stubInterface<BasicAuthenticator>(), AuthType.Basic],
    [
      'simple-token',
      sinon.stubInterface<SimpleTokenAuthenticator>(),
      AuthType.SimpleToken,
    ],
    [
      'password-file',
      sinon.stubInterface<PasswordFileAuthenticator>(),
      AuthType.PasswordFile,
    ],
  ])(
    'Should auth successful when request match "%p" authorization',
    async (type, authenticator, tokenIdentifier) => {
      // Arrange
      const expected = {
        name: 'user1',
        attr: { role: 'engineer' },
      };

      const options = {};

      // stub authenticator
      authenticator.getExtensionId.returns(type);
      authenticator.authCredential.resolves({
        status: AuthStatus.SUCCESS,
        type,
        user: {
          name: expected.name,
          attr: expected.attr,
        },
      } as AuthResult);

      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<Request>(),
          headers: {
            ...sinon.stubInterface<IncomingHttpHeaders>(),
            authorization: `${tokenIdentifier} 123`,
          },
        },
        state: {
          ...sinon.stubInterface<{ user: AuthUserInfo }>(),
        },
      };

      // Act
      const middleware = new AuthCredentialsMiddleware(
        { options: { [type]: options } },
        '',
        [authenticator],
        new ProjectOptions()
      );
      await middleware.activate();
      await middleware.handle(ctx, async () => Promise.resolve());

      expect(ctx.state.user).toEqual(expected);
    }
  );

  it.each([
    ['basic', sinon.stubInterface<BasicAuthenticator>(), AuthType.Basic],
    [
      'simple-token',
      sinon.stubInterface<SimpleTokenAuthenticator>(),
      AuthType.SimpleToken,
    ],
    [
      'password-file',
      sinon.stubInterface<PasswordFileAuthenticator>(),
      AuthType.PasswordFile,
    ],
  ])(
    'Should auth failed when got AuthStatus.FAIL at matched authenticator',
    async (type, authenticator, tokenIdentifier) => {
      // Arrange
      const expected = {
        type,
        message: `authenticate user by "${authenticator.getExtensionId()}" type failed.`,
      };

      const options = {};

      // stub authenticator
      authenticator.getExtensionId.returns(type);
      authenticator.authCredential.resolves({
        status: AuthStatus.FAIL,
        type,
        message: expected.message,
      } as AuthResult);

      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        status: sinon.stubInterface<any>(),
        request: {
          ...sinon.stubInterface<Request>(),
          headers: {
            ...sinon.stubInterface<IncomingHttpHeaders>(),
            authorization: `${tokenIdentifier} 123`,
          },
        },
        body: sinon.stubInterface<Record<string, any>>(),
      };

      // Act
      const middleware = new AuthCredentialsMiddleware(
        { options: { [type]: options } },
        '',
        [authenticator],
        new ProjectOptions()
      );
      await middleware.activate();
      await middleware.handle(ctx, async () => Promise.resolve());

      expect(ctx.status).toEqual(401);
      expect(ctx.body).toEqual(expected);
    }
  );

  it.each([
    ['basic', sinon.stubInterface<BasicAuthenticator>(), AuthType.Basic],
    [
      'simple-token',
      sinon.stubInterface<SimpleTokenAuthenticator>(),
      AuthType.SimpleToken,
    ],
    [
      'password-file',
      sinon.stubInterface<PasswordFileAuthenticator>(),
      AuthType.PasswordFile,
    ],
  ])(
    // user use this authenticator, but this authenticator does not configured properly.
    'Should auth failed when got AuthStatus.INDETERMINATE at matched authenticator',
    async (type, authenticator, tokenIdentifier) => {
      // Arrange
      const expected = new Error('All types of authenticator failed.');

      const options = {};

      // stub authenticator
      authenticator.getExtensionId.returns(type);
      authenticator.authCredential.resolves({
        status: AuthStatus.INDETERMINATE,
        type,
      } as AuthResult);

      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        status: sinon.stubInterface<any>(),
        request: {
          ...sinon.stubInterface<Request>(),
          headers: {
            ...sinon.stubInterface<IncomingHttpHeaders>(),
            authorization: `${tokenIdentifier} 123`,
          },
        },
        body: sinon.stubInterface<Record<string, any>>(),
      };

      // Act
      const middleware = new AuthCredentialsMiddleware(
        { options: { [type]: options } },
        '',
        [authenticator],
        new ProjectOptions()
      );
      await middleware.activate();
      const handle = async () =>
        await middleware.handle(ctx, async () => Promise.resolve());

      expect(handle()).rejects.toThrow(expected);
    }
  );
  it('Should throw "Please provide proper authorization information" when does not provide authorization info', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      status: sinon.stubInterface<any>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          // empty authorization
          authorization: '',
        },
      },
      body: sinon.stubInterface<Record<string, any>>(),
    };
    const type = AuthType.Basic;
    const authenticator = sinon.stubInterface<BasicAuthenticator>();
    authenticator.getExtensionId.returns(type);
    const expected = new Error(
      'Please provide proper authorization information'
    );

    // Act
    const middleware = new AuthCredentialsMiddleware(
      { options: { [type]: {} } },
      '',
      [authenticator],
      new ProjectOptions()
    );
    await middleware.activate();
    const handle = async () =>
      await middleware.handle(ctx, async () => Promise.resolve());

    // Assert
    expect(handle()).rejects.toThrow(expected);
  });
  it.each([
    ['basic', sinon.stubInterface<BasicAuthenticator>()],
    ['simple-token', sinon.stubInterface<SimpleTokenAuthenticator>()],
    ['password-file', sinon.stubInterface<PasswordFileAuthenticator>()],
  ])(
    'Should throw "All types of authenticator failed" when match with the authenticator but with a invalid tokenIdentifier',
    async (type, authenticator) => {
      const expected = new Error('All types of authenticator failed.');
      authenticator.getExtensionId.returns(type);
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        status: sinon.stubInterface<any>(),
        request: {
          ...sinon.stubInterface<Request>(),
          headers: {
            ...sinon.stubInterface<IncomingHttpHeaders>(),
            authorization: 'InvalidTokenIdentifier 123',
          },
        },
        body: sinon.stubInterface<Record<string, any>>(),
      };

      // Act
      const middleware = new AuthCredentialsMiddleware(
        { options: { [type]: {} } },
        '',
        [authenticator],
        new ProjectOptions()
      );
      await middleware.activate();
      const handle = async () =>
        await middleware.handle(ctx, async () => Promise.resolve());

      // Assert
      expect(handle()).rejects.toThrow(expected);
    }
  );
});
