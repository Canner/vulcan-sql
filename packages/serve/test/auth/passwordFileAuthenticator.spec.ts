import * as path from 'path';
import * as sinon from 'ts-sinon';
import { IncomingHttpHeaders } from 'http';
import { BaseResponse } from 'koa';
import { PasswordFileAuthenticator } from '@vulcan-sql/serve/auth';
import { AuthResult, AuthStatus, KoaContext } from '@vulcan-sql/serve/models';
import faker from '@faker-js/faker';
import { BodyRequest } from './types';

const authCredential = async (
  ctx: KoaContext,
  options: any
): Promise<AuthResult> => {
  const authenticator = new PasswordFileAuthenticator({ options }, '');
  await authenticator.activate();
  return await authenticator.authCredential(ctx);
};

const getTokenInfo = async (
  ctx: KoaContext,
  options: any
): Promise<Record<string, any>> => {
  const authenticator = new PasswordFileAuthenticator({ options }, '');
  await authenticator.activate();
  return await authenticator.getTokenInfo(ctx);
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
      const result = await authCredential(ctx, options);

      // Assert
      expect(result).toEqual(expectIncorrect);
    }
  );
  it('Test to auth credential failed when request header not exist "authorization" key', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<BodyRequest>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
        },
      },
    } as KoaContext;

    // Act
    const result = await authCredential(ctx, {
      'password-file': { path: '', users: [] },
    });

    // Assert
    expect(result).toEqual(expectIncorrect);
  });

  it('Should auth credential failed when request header "authorization" not start with "password-file"', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<BodyRequest>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: '',
        },
      },
    } as KoaContext;

    // Act
    const result = await authCredential(ctx, {
      'password-file': { path: '', users: [] },
    });

    // Assert
    expect(result).toEqual(expectIncorrect);
  });

  it('Should auth credential failed when "path" is empty in "password-file" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<BodyRequest>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `password-file ${invalidToken}`,
        },
      },
    };

    // Act
    const result = await authCredential(ctx, {
      'password-file': { path: '', users: [] },
    });

    // Assert
    expect(result).toEqual(expectFailed);
  });
  it('Should auth credential failed when "path" is not file in "password-file" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<BodyRequest>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `password-file ${invalidToken}`,
        },
      },
      set: sinon.stubInterface<BaseResponse>().set,
    };
    // Act
    const result = await authCredential(ctx, {
      'password-file': { path: path.resolve(__dirname, './test-files') },
    });

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it('Should auth credential failed when request header "authorization" not match in "password-file" path of options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<BodyRequest>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `password-file ${invalidToken}`,
        },
      },
    };

    // Act
    const result = await authCredential(ctx, {
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
    'Should auth credential successful when request header "authorization" matched in "password-file" options',
    async (authScheme, userData) => {
      // Arrange
      const { name, password } = userData;
      const token = Buffer.from(`${name}:${password}`).toString('base64');
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<BodyRequest>(),
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
      const result = await authCredential(ctx, {
        'password-file': {
          path: path.resolve(__dirname, './test-files/password-file'),
          users: userLists,
        },
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it('Should get token successfully when request match in "password-file" path of options', async () => {
    // Arrange
    const expected = Buffer.from('user3:test3').toString('base64');

    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<BodyRequest>(),
        body: {
          username: 'user3',
          password: 'test3',
        },
      },
    };

    // Act
    const result = await getTokenInfo(ctx, {
      'password-file': {
        path: path.resolve(__dirname, './test-files/password-file'),
      },
    });

    // Assert
    expect(result['token']).toEqual(expected);
  });

  it.each([['username'], ['password']])(
    'Should get token failed when miss some of request fields',
    async (field: string) => {
      // Arrange
      const expected = new Error('please provide "username" and "password".');
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<BodyRequest>(),
          body: {
            [field]: faker.word.noun(),
          },
        },
      };
      // Act
      const action = getTokenInfo(ctx, {
        'password-file': {
          path: path.resolve(__dirname, './test-files/password-file'),
        },
      });
      // Assert
      expect(action).rejects.toThrow(expected);
    }
  );

  it('Should get token failed when miss request field', async () => {
    // Arrange
    const expected = new Error('please provide "username" and "password".');
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<BodyRequest>(),
        body: {},
      },
    };
    // Act
    const action = getTokenInfo(ctx, {
      'password-file': {
        path: path.resolve(__dirname, './test-files/password-file'),
      },
    });
    // Assert
    expect(action).rejects.toThrow(expected);
  });
});
