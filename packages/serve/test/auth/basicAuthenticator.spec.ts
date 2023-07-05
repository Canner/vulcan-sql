import * as path from 'path';
import * as md5 from 'md5';
import * as sinon from 'ts-sinon';
import { IncomingHttpHeaders } from 'http';
import { Request, BaseResponse } from 'koa';
import {
  BasicAuthenticator,
  AuthUserListOptions,
  BasicOptions,
} from '@vulcan-sql/serve/auth';
import { AuthResult, AuthStatus, KoaContext } from '@vulcan-sql/serve/models';
import faker from '@faker-js/faker';

const authCredential = async (
  ctx: KoaContext,
  options: any
): Promise<AuthResult> => {
  const authenticator = new BasicAuthenticator({ options }, '');
  await authenticator.activate();
  return await authenticator.authCredential(ctx);
};

const getTokenInfo = async (
  ctx: KoaContext,
  options: any
): Promise<Record<string, any>> => {
  const authenticator = new BasicAuthenticator({ options }, '');
  await authenticator.activate();
  return await authenticator.getTokenInfo(ctx);
};

describe('Test http basic authenticator', () => {
  const expectIncorrect = {
    status: AuthStatus.INDETERMINATE,
    type: 'basic',
  };

  const expectFailed = {
    status: AuthStatus.FAIL,
    type: 'basic',
    message: 'authenticate user by "basic" type failed.',
  };
  const invalidToken = Buffer.from('invalidUser:test').toString('base64');
  const userTokenInList = Buffer.from('user1:test1').toString('base64');

  const userLists = [
    {
      name: 'user1',
      md5Password: md5('test1'),
      attr: {
        role: 'data engineer',
      },
    },
    {
      name: 'user2',
      md5Password: md5('test2'),
      attr: {
        role: 'sales',
      },
    },
  ] as Array<AuthUserListOptions>;

  it.each([[{}], [{ basic: {} }]])(
    'Should auth incorrect when options = %p in options',
    async (options) => {
      // Arrange
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<Request>(),
        },
      } as KoaContext;

      // Act
      const result = await authCredential(ctx, options);

      // Assert
      expect(result).toEqual(expectIncorrect);
    }
  );

  it('Should auth credential failed when request header "authorization" not match in empty "users-list" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `Basic ${invalidToken}`,
        },
      },
      set: sinon.stubInterface<BaseResponse>().set,
    };
    // expect set header to response
    const expectedHeader = ['WWW-Authenticate', 'basic'];

    // Act
    const result = await authCredential(ctx, { basic: { 'users-list': [] } });

    // Assert
    expect(result).toEqual(expectFailed);
    expect(ctx.set.getCall(0).args).toEqual(expectedHeader);
  });

  it.each([['Basic'], ['BASIC'], ['basic']])(
    'Should auth credential successful when request header "authorization" match in "users-list" options',
    async (authScheme) => {
      // Arrange
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<Request>(),
          headers: {
            ...sinon.stubInterface<IncomingHttpHeaders>(),
            authorization: `${authScheme} ${userTokenInList}`,
          },
        },
      };

      const expected = {
        status: AuthStatus.SUCCESS,
        type: 'basic',
        user: {
          name: userLists[0].name,
          attr: userLists[0].attr,
        },
      } as AuthResult;

      // Act
      const result = await authCredential(ctx, {
        basic: { 'users-list': userLists },
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it('Should auth credential failed when "htpasswd-file" path not exist in options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `Basic ${userTokenInList}`,
        },
      },
      set: sinon.stubInterface<BaseResponse>().set,
    };
    // expect set header to response
    const expectedHeader = ['WWW-Authenticate', 'basic'];

    // Act
    const result = await authCredential(ctx, {
      basic: { 'htpasswd-file': {} },
    });

    // Assert
    expect(result).toEqual(expectFailed);
    expect(ctx.set.getCall(0).args).toEqual(expectedHeader);
  });

  it('Should auth credential failed when "htpasswd-file" path is not a file in options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `Basic ${userTokenInList}`,
        },
      },
      set: sinon.stubInterface<BaseResponse>().set,
    };
    // expect set header to response
    const expectedHeader = ['WWW-Authenticate', 'basic'];

    // Act
    const result = await authCredential(ctx, {
      basic: {
        'htpasswd-file': { path: path.resolve(__dirname, './test-files') },
      },
    });

    // Assert
    expect(result).toEqual(expectFailed);
    expect(ctx.set.getCall(0).args).toEqual(expectedHeader);
  });

  it('Should auth credential failed when request header "authorization" not match in "htpasswd-file" path of options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `Basic ${invalidToken}`,
        },
      },
      set: sinon.stubInterface<BaseResponse>().set,
    };
    // expect set header to response
    const expectedHeader = ['WWW-Authenticate', 'basic'];

    // Act
    const result = await authCredential(ctx, {
      basic: {
        'htpasswd-file': {
          path: path.resolve(__dirname, './test-files/basic.htpasswd'),
        },
      },
    });

    // Assert
    expect(result).toEqual(expectFailed);
    expect(ctx.set.getCall(0).args).toEqual(expectedHeader);
  });

  it('Should auth credential successfully when request header "authorization" match in "htpasswd-file" path of options', async () => {
    // Arrange
    const userTokenInFile = Buffer.from('user3:test3').toString('base64');
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `Basic ${userTokenInFile}`,
        },
      },
      set: sinon.stubInterface<BaseResponse>().set,
    };
    const userInFile = { name: 'user3', attr: { job: 'sales' } };
    const expected = {
      status: AuthStatus.SUCCESS,
      type: 'basic',
      user: {
        name: userInFile.name,
        attr: userInFile.attr,
      },
    } as AuthResult;

    // Act
    const result = await authCredential(ctx, {
      basic: {
        'htpasswd-file': {
          path: path.resolve(__dirname, './test-files/basic.htpasswd'),
          users: [userInFile],
        },
      },
    });

    // Assert
    expect(result).toEqual(expected);
  });

  it('Should get token successfully when request match in "users-list" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        body: {
          username: 'user1',
          password: 'test1',
        },
      },
    };
    const expected = Buffer.from('user1:test1').toString('base64');
    // Act
    const result = await getTokenInfo(ctx, {
      basic: { 'users-list': userLists },
    });
    // Assert
    expect(result['token']).toEqual(expected);
  });

  it('Should get token successfully when request match in "htpasswd-file" path of options', async () => {
    // Arrange
    const expected = Buffer.from('user3:test3').toString('base64');

    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        body: {
          username: 'user3',
          password: 'test3',
        },
      },
      set: sinon.stubInterface<BaseResponse>().set,
    };

    // Act
    const result = await getTokenInfo(ctx, {
      basic: {
        'htpasswd-file': {
          path: path.resolve(__dirname, './test-files/basic.htpasswd'),
        },
      },
    });

    // Assert
    expect(result['token']).toEqual(expected);
  });

  it.each([
    ['username', { 'users-list': userLists }],
    ['password', { 'users-list': userLists }],
    [
      'username',
      {
        'htpasswd-file': {
          path: path.resolve(__dirname, './test-files/basic.htpasswd'),
        },
      },
    ],
    [
      'password',
      {
        'htpasswd-file': {
          path: path.resolve(__dirname, './test-files/basic.htpasswd'),
        },
      },
    ],
  ])(
    'Should get token failed when miss some of request fields',
    async (field: string, options: BasicOptions) => {
      // Arrange
      const expected = new Error('please provide "username" and "password".');
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<Request>(),
          body: {
            [field]: faker.word.noun(),
          },
        },
      };
      // Act
      const action = getTokenInfo(ctx, {
        basic: options,
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
        ...sinon.stubInterface<Request>(),
        body: {},
      },
    };
    // Act
    const action = getTokenInfo(ctx, {
      basic: {
        'htpasswd-file': {
          path: path.resolve(__dirname, './test-files/basic.htpasswd'),
        },
      },
    });
    // Assert
    expect(action).rejects.toThrow(expected);
  });
});
