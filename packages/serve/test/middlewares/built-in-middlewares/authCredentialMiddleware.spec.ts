import * as sinon from 'ts-sinon';
import { AuthCredentialMiddleware } from '@vulcan-sql/serve/middleware';
import {
  AuthResult,
  AuthStatus,
  AuthUserInfo,
  KoaContext,
} from '@vulcan-sql/serve/models';
import * as lodash from 'lodash';
import {
  BasicAuthenticator,
  PasswordFileAuthenticator,
  SimpleTokenAuthenticator,
} from '@vulcan-sql/serve';

describe('Test auth credential middleware', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Should return to stop auth middleware when enabled = false', async () => {
    // Arrange
    const middleware = new AuthCredentialMiddleware(
      {
        enabled: false,
      },
      '',
      []
    );
    // spy the async function to do test
    const spy = jest.spyOn(lodash, 'isEmpty');

    // Act
    await middleware.activate();

    expect(spy).not.toHaveBeenCalled();
  });

  it.each([[{}], [undefined]])(
    'Should throw error when options = %p',
    async (options) => {
      // Arrange
      const expected = new Error(
        'please set at least one auth type and user credential when you enable the "auth" options.'
      );

      // Act
      const middleware = new AuthCredentialMiddleware(
        { options: options },
        '',
        []
      );
      const activateFunc = async () => await middleware.activate();

      expect(activateFunc).rejects.toThrow(expected);
    }
  );

  it.each([
    ['basic', sinon.stubInterface<BasicAuthenticator>()],
    ['simple-token', sinon.stubInterface<SimpleTokenAuthenticator>()],
    ['password-file', sinon.stubInterface<PasswordFileAuthenticator>()],
  ])(
    'Should auth successful when request match "%p" authorization',
    async (type, authenticator) => {
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
        state: {
          ...sinon.stubInterface<{ user: AuthUserInfo }>(),
        },
      };

      // Act
      const middleware = new AuthCredentialMiddleware(
        { options: { [type]: options } },
        '',
        [authenticator]
      );
      await middleware.activate();
      await middleware.handle(ctx, async () => Promise.resolve());

      expect(ctx.state.user).toEqual(expected);
    }
  );

  it.each([
    ['basic', sinon.stubInterface<BasicAuthenticator>()],
    ['simple-token', sinon.stubInterface<SimpleTokenAuthenticator>()],
    ['password-file', sinon.stubInterface<PasswordFileAuthenticator>()],
  ])(
    'Should auth successful when request match %p authorization',
    async (type, authenticator) => {
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
        body: sinon.stubInterface<Record<string, any>>(),
      };

      // Act
      const middleware = new AuthCredentialMiddleware(
        { options: { [type]: options } },
        '',
        [authenticator]
      );
      await middleware.activate();
      await middleware.handle(ctx, async () => Promise.resolve());

      expect(ctx.status).toEqual(401);
      expect(ctx.body).toEqual(expected);
    }
  );

  it.each([
    ['basic', sinon.stubInterface<BasicAuthenticator>()],
    ['simple-token', sinon.stubInterface<SimpleTokenAuthenticator>()],
    ['password-file', sinon.stubInterface<PasswordFileAuthenticator>()],
  ])(
    'Should auth successful when request match  authorization',
    async (type, authenticator) => {
      // Arrange
      const expected = new Error('all types of authenticator failed.');

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
        body: sinon.stubInterface<Record<string, any>>(),
      };

      // Act
      const middleware = new AuthCredentialMiddleware(
        { options: { [type]: options } },
        '',
        [authenticator]
      );
      await middleware.activate();
      const handle = async () =>
        await middleware.handle(ctx, async () => Promise.resolve());

      expect(handle()).rejects.toThrow(expected);
    }
  );
});
