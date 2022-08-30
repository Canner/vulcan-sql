import * as path from 'path';
import * as sinon from 'ts-sinon';
import { IncomingHttpHeaders } from 'http';
import { Request, BaseResponse } from 'koa';
import { PasswordFileAuthenticator } from '@vulcan-sql/serve/auth';
import { AuthResult, AuthStatus, KoaContext } from '@vulcan-sql/serve/models';

const authenticate = async (
  ctx: KoaContext,
  options: any
): Promise<AuthResult> => {
  const authenticator = new PasswordFileAuthenticator({ options }, '');
  await authenticator.activate();
  return await authenticator.authenticate(ctx);
};

describe('Test password-file authenticator', () => {
  const expectIncorrect = {
    status: AuthStatus.INDETERMINATE,
    type: 'password-file',
  };
  const expectFailed = {
    status: AuthStatus.FAIL,
    type: 'password-file',
    message: 'authenticate user by "password-file" type failed.',
  };
  const invalidToken = Buffer.from('invalidUser:test').toString('base64');

  const userLists = [
    {
      name: 'user3',
      password: 'test3',
      attr: {
        role: 'data engineer',
      },
    },
    {
      name: 'user4',
      password: 'test4',
      attr: {
        role: 'sales',
      },
    },
  ];

  it.each([[{}], [{ 'simple-token': [] }], [{ basic: {} }]])(
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
    const result = await authenticate(ctx, {
      'password-file': { path: '', users: [] },
    });

    // Assert
    expect(result).toEqual(expectIncorrect);
  });

  it('Should auth failed when request header "authorization" not start with "password-file"', async () => {
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
    const result = await authenticate(ctx, {
      'password-file': { path: '', users: [] },
    });

    // Assert
    expect(result).toEqual(expectIncorrect);
  });

  it('Should auth failed when "path" is empty in "password-file" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `password-file ${invalidToken}`,
        },
      },
    };

    // Act
    const result = await authenticate(ctx, {
      'password-file': { path: '', users: [] },
    });

    // Assert
    expect(result).toEqual(expectFailed);
  });
  it('Should auth failed when "path" is not file in "password-file" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `password-file ${invalidToken}`,
        },
      },
      set: sinon.stubInterface<BaseResponse>().set,
    };
    // Act
    const result = await authenticate(ctx, {
      'password-file': { path: path.resolve(__dirname, './test-files') },
    });

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it('Should auth failed when request header "authorization" not match in "password-file" path of options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `password-file ${invalidToken}`,
        },
      },
    };

    // Act
    const result = await authenticate(ctx, {
      'password-file': {
        path: path.resolve(__dirname, './password-file'),
      },
    });

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it.each([
    ['PASSWORD-FILE', userLists[0]],
    ['PASSWORD-FILE', userLists[1]],
    ['Password-File', userLists[0]],
    ['Password-File', userLists[1]],
    ['password-file', userLists[0]],
    ['password-file', userLists[1]],
  ])(
    'Should auth successful when request header "authorization" matched in "password-file" options',
    async (authScheme, userData) => {
      // Arrange
      const { name, password } = userData;
      const token = Buffer.from(`${name}:${password}`).toString('base64');
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<Request>(),
          headers: {
            ...sinon.stubInterface<IncomingHttpHeaders>(),
            authorization: `${authScheme} ${token}`,
          },
        },
      } as KoaContext;

      const expected = {
        status: AuthStatus.SUCCESS,
        type: 'password-file',
        user: {
          name: userData.name,
          attr: userData.attr,
        },
      } as AuthResult;

      // Act
      const result = await authenticate(ctx, {
        'password-file': {
          path: path.resolve(__dirname, './test-files/password-file'),
          users: userLists,
        },
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );
});
