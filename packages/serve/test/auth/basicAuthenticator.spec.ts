import * as path from 'path';
import * as sinon from 'ts-sinon';
import { IncomingHttpHeaders } from 'http';
import { Request } from 'koa';
import { BasicAuthenticator } from '@vulcan-sql/serve/auth';
import {
  AuthResult,
  KoaContext,
  UserAuthOptions,
} from '@vulcan-sql/serve/models';

describe('Test http basic authenticator', () => {
  const expectFailed = { authenticated: false };
  const oriEnv = process.env;
  const envVariable = 'TOKEN_VALUE';

  const invalidToken = Buffer.from('invalid-user').toString('base64');
  const user3Token = Buffer.from('user3').toString('base64');

  const usersOptions = [
    {
      name: 'user1',
      auth: {
        method: 'basic',
        token: Buffer.from('user1').toString('base64'),
      },
      attr: {
        role: 'data engineer',
      },
    },
    {
      name: 'user2',
      auth: {
        method: 'basic',
        token: Buffer.from('user2').toString('base64'),
      },
      attr: {
        role: 'sales',
      },
    },
    {
      name: 'user3',
      auth: {
        method: 'basic',
        // user3
        token: `{{${envVariable}}}`,
      },
      attr: {
        role: 'qa engineer',
      },
    },
    {
      name: 'user4',
      auth: {
        method: 'basic',
        // user3
        file: `${path.resolve(__dirname, './test-files/basic.htpasswd')}`,
      },
      attr: {
        role: 'web engineer',
      },
    },
  ] as Array<UserAuthOptions>;

  afterEach(() => {
    process.env = oriEnv;
  });
  it('Should auth failed when not find any basic method in "user-auth" config', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
    } as KoaContext;

    // Act
    const authenticator = new BasicAuthenticator({}, '');
    const result = await authenticator.authenticate([], ctx);

    // Assert
    expect(result).toEqual(expectFailed);
  });
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
    const authenticator = new BasicAuthenticator({}, '');
    const result = await authenticator.authenticate(usersOptions, ctx);

    // Assert
    expect(result).toEqual(expectFailed);
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
    const authenticator = new BasicAuthenticator({}, '');
    const result = await authenticator.authenticate(usersOptions, ctx);

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it('Test to auth failed when request header "authorization" not match "token" value in "user-auth" config', async () => {
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
    } as KoaContext;

    // Act
    const authenticator = new BasicAuthenticator({}, '');
    const result = await authenticator.authenticate(usersOptions, ctx);

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it.each([
    [`Basic ${usersOptions[0].auth['token']}`],
    [`BASIC ${usersOptions[0].auth['token']}`],
    [`basic ${usersOptions[0].auth['token']}`],
  ])(
    'Should auth successful when request header "authorization"  match "token" value in "user-auth" config',
    async (authToken) => {
      // Arrange
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<Request>(),
          headers: {
            ...sinon.stubInterface<IncomingHttpHeaders>(),
            authorization: authToken,
          },
        },
      } as KoaContext;

      const expected = {
        authenticated: true,
        user: {
          name: usersOptions[0].name,
          method: usersOptions[0].auth.method,
          attr: usersOptions[0].attr,
        },
      } as AuthResult;
      // Act
      const authenticator = new BasicAuthenticator({}, '');
      const result = await authenticator.authenticate(usersOptions, ctx);

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it('Test to auth failed when request header "authorization" not match "token" env variable value in "user-auth" options', async () => {
    // Arrange
    process.env[envVariable] = user3Token;

    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          authorization: `Basic ${invalidToken}`,
        },
      },
    } as KoaContext;

    // Act
    const authenticator = new BasicAuthenticator({}, '');
    const result = await authenticator.authenticate(usersOptions, ctx);

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it.each([
    [`Basic ${user3Token}`],
    [`BASIC ${user3Token}`],
    [`basic ${user3Token}`],
  ])(
    'Should auth successful when request header "authorization" not match "token" env variable value in "user-auth" options',
    async (authToken) => {
      // Arrange
      process.env[envVariable] = user3Token as string;

      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        request: {
          ...sinon.stubInterface<Request>(),
          headers: {
            ...sinon.stubInterface<IncomingHttpHeaders>(),
            authorization: authToken,
          },
        },
      } as KoaContext;

      const expected = {
        authenticated: true,
        user: {
          name: usersOptions[2].name,
          method: usersOptions[2].auth.method,
          attr: usersOptions[2].attr,
        },
      } as AuthResult;
      // Act
      const authenticator = new BasicAuthenticator({}, '');
      const result = await authenticator.authenticate(usersOptions, ctx);

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it('Should auth failed when "file" path not exist in "user-auth" options', async () => {
    // Arrange

    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          // user 4 token value
          authorization: `Basic dXNlcjQ=`,
        },
      },
    } as KoaContext;

    // user4
    const options = [
      {
        name: usersOptions[3].name,
        auth: {
          method: usersOptions[3].auth.method,
          file: 'not-a-file-path',
        },
        attr: usersOptions[3].attr,
      },
    ] as Array<UserAuthOptions>;
    // Act
    const authenticator = new BasicAuthenticator({}, '');
    const result = await authenticator.authenticate(options, ctx);

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it('Test to auth failed when "file" is not a file in "user-auth" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          // user 4 token value
          authorization: `Basic dXNlcjQ=`,
        },
      },
    } as KoaContext;

    // user4
    const options = [
      {
        name: usersOptions[3].name,
        auth: {
          method: usersOptions[3].auth.method,
          file: path.resolve(__dirname, './test-files'),
        },
        attr: usersOptions[3].attr,
      },
    ] as Array<UserAuthOptions>;
    // Act
    const authenticator = new BasicAuthenticator({}, '');
    const result = await authenticator.authenticate(options, ctx);

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it('Should auth failed when request header "authorization" not match token in "file" path of the "user-auth" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          // user 4 token value
          authorization: `Basic ${Buffer.from('user5').toString('base64')}`,
        },
      },
    } as KoaContext;

    // user4
    const options = [
      {
        name: usersOptions[3].name,
        auth: {
          method: usersOptions[3].auth.method,
          file: path.resolve(__dirname, './test-files/basic.htpasswd'),
        },
        attr: usersOptions[3].attr,
      },
    ] as Array<UserAuthOptions>;
    // Act
    const authenticator = new BasicAuthenticator({}, '');
    const result = await authenticator.authenticate(options, ctx);

    // Assert
    expect(result).toEqual(expectFailed);
  });

  it('Should auth successful when request header "authorization" match token in "file" path of the "user-auth" options', async () => {
    // Arrange
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        headers: {
          ...sinon.stubInterface<IncomingHttpHeaders>(),
          // user 4 token value
          authorization: `Basic dXNlcjQ=`,
        },
      },
    } as KoaContext;

    // user4
    const options = [
      {
        name: usersOptions[3].name,
        auth: {
          method: usersOptions[3].auth.method,
          file: path.resolve(__dirname, './test-files/basic.htpasswd'),
        },
        attr: usersOptions[3].attr,
      },
    ] as Array<UserAuthOptions>;

    const expected = {
      authenticated: true,
      user: {
        name: usersOptions[3].name,
        method: usersOptions[3].auth.method,
        attr: usersOptions[3].attr,
      },
    } as AuthResult;
    // Act
    const authenticator = new BasicAuthenticator({}, '');
    const result = await authenticator.authenticate(options, ctx);

    // Assert
    expect(result).toEqual(expected);
  });
});
