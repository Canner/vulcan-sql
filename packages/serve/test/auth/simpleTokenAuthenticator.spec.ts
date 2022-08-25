import * as md5 from 'md5';
import * as sinon from 'ts-sinon';
import { IncomingHttpHeaders } from 'http';
import { Request } from 'koa';
import {
  SimpleTokenAuthenticator,
  SimpleTokenOptions,
} from '@vulcan-sql/serve/auth';
import { AuthResult, AuthStatus, KoaContext } from '@vulcan-sql/serve/models';

const authenticate = async (
  ctx: KoaContext,
  options: any
): Promise<AuthResult> => {
  const authenticator = new SimpleTokenAuthenticator({ options }, '');
  await authenticator.activate();
  return await authenticator.authenticate(ctx);
};

describe('Test simple-token authenticator', () => {
  const expectIncorrect = {
    status: AuthStatus.INCORRECT,
    type: 'simple-token',
  };
  const expectFailed = {
    status: AuthStatus.FAIL,
    type: 'simple-token',
    message: 'authenticate user by "simple-token" type failed.',
  };
  const invalidToken = Buffer.from('invalidUser:test').toString('base64');

  const userLists = [
    {
      name: 'user1',
      token: Buffer.from('user1:test1').toString('base64'),
      attr: {
        role: 'data engineer',
      },
    },
    {
      name: 'user2',
      token: md5('user1:test1'),
      attr: {
        role: 'sales',
      },
    },
  ] as SimpleTokenOptions;

  it.each([[{}], [{ basic: {} }], [{ 'simple-token': [] }]])(
    'Should auth incorrect when options = %p in options',
    async (options) => {
      // Arrange
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
      } as KoaContext;

      // Act
      const result = await authenticate(ctx, options);

      // Assert
      expect(result).toEqual(expectIncorrect);
    }
  );
  it('Test to auth failed when request header not exist "authorization" key', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
        },
      },
    } as KoaContext;

    // Act
    const result = await authenticate(ctx, { 'simple-token': userLists });

    // Assert
    expect(result).toEqual(expectIncorrect);
  });

  it('Should auth failed when request header "authorization" not start with "simple-token"', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: '',
        },
      },
    } as KoaContext;

    // Act
    const result = await authenticate(ctx, { 'simple-token': userLists });

    // Assert
    expect(result).toEqual(expectIncorrect);
  });

  it('Should auth failed when request header "authorization" not matched in empty simple-token" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `SIMPLE-TOKEN ${invalidToken}`,
        },
      },
    };

    // Act
    const result = await authenticate(ctx, { 'simple-token': userLists });

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it.each([
    ['SIMPLE-TOKEN', userLists[0]],
    ['SIMPLE-TOKEN', userLists[1]],
    ['Simple-Token', userLists[0]],
    ['Simple-Token', userLists[1]],
    ['simple-token', userLists[0]],
    ['simple-token', userLists[1]],
  ])(
    'Should auth successful when request header "authorization" matched in "simple-token" options',
    async (authScheme, userData) => {
      // Arrange
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<Request>(),
          headers: {
            ...sinon.stubInterface<IncomingHttpHeaders>(),
            authorization: `${authScheme} ${userData.token}`,
          },
        },
      } as KoaContext;

      const expected = {
        status: AuthStatus.SUCCESS,
        type: 'simple-token',
        user: {
          name: userData.name,
          attr: userData.attr,
        },
      } as AuthResult;

      // Act
      const result = await authenticate(ctx, {
        'simple-token': userLists,
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );
});
