import * as path from 'path';
import * as md5 from 'md5';
import * as sinon from 'ts-sinon';
import { IncomingHttpHeaders } from 'http';
import { Request, BaseResponse } from 'koa';
import {
  BasicAuthenticator,
  AuthUserListOptions,
} from '@vulcan-sql/serve/auth';
import { AuthResult, AuthStatus, KoaContext } from '@vulcan-sql/serve/models';

const authenticate = async (
  ctx: KoaContext,
  options: any
): Promise<AuthResult> => {
  const authenticator = new BasicAuthenticator({ options }, '');
  await authenticator.activate();
  return await authenticator.authenticate(ctx);
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

  it.each([[{}], [{ 'non-basic': {} }], [{ basic: {} }]])(
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
    const result = await authenticate(ctx, { basic: {} });

    // Assert
    expect(result).toEqual(expectIncorrect);
  });

  it('Should auth failed when request header "authorization" not start with "basic"', async () => {
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
    const result = await authenticate(ctx, { basic: {} });

    // Assert
    expect(result).toEqual(expectIncorrect);
  });

  it('Should auth failed when request header "authorization" not matched in empty "users-list" options', async () => {
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
    const result = await authenticate(ctx, { basic: { 'users-list': [] } });

    // Assert
    expect(result).toEqual(expectFailed);
    expect(ctx.set.getCall(0).args).toEqual(expectedHeader);
  });

  it.each([['Basic'], ['BASIC'], ['basic']])(
    'Should auth successful when request header "authorization" matched in "users-list" options',
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
      } as KoaContext;

      const expected = {
        status: AuthStatus.SUCCESS,
        type: 'basic',
        user: {
          name: userLists[0].name,
          attr: userLists[0].attr,
        },
      } as AuthResult;

      // Act
      const result = await authenticate(ctx, {
        basic: { 'users-list': userLists },
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it('Should auth failed when "htpasswd-file" path not exist in options', async () => {
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
    const result = await authenticate(ctx, {
      basic: { 'htpasswd-file': {} },
    });

    // Assert
    expect(result).toEqual(expectFailed);
    expect(ctx.set.getCall(0).args).toEqual(expectedHeader);
  });

  it('Should auth failed when "htpasswd-file" path is not a file in options', async () => {
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
    const result = await authenticate(ctx, {
      basic: {
        'htpasswd-file': { path: path.resolve(__dirname, './test-files') },
      },
    });

    // Assert
    expect(result).toEqual(expectFailed);
    expect(ctx.set.getCall(0).args).toEqual(expectedHeader);
  });

  it('Should auth failed when request header "authorization" not match in "htpasswd-file" path of options', async () => {
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
    const result = await authenticate(ctx, {
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

  it('Should auth successfully when request header "authorization" match in "htpasswd-file" path of options', async () => {
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
    const result = await authenticate(ctx, {
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
});
