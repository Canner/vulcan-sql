import * as sinon from 'ts-sinon';
import * as Koa from 'koa';
import faker from '@faker-js/faker';
import * as supertest from 'supertest';
import * as koaParseBody from 'koa-bodyparser';
import {
  AuthCredentialsMiddleware,
  AuthRouterMiddleware,
} from '@vulcan-sql/serve/middleware';
import {
  AuthOptions,
  AuthResult,
  AuthStatus,
  BaseAuthenticator,
} from '@vulcan-sql/serve/models';
import { Server } from 'http';
import { BasicAuthenticator } from '@vulcan-sql/serve';
import { ProjectOptions } from '@vulcan-sql/core';

const runServer = async (
  options: { enabled?: boolean; options?: AuthOptions },
  authenticators: Record<string, sinon.StubbedInstance<BaseAuthenticator<any>>>
) => {
  const app = new Koa();
  const middleware = new AuthRouterMiddleware(
    options,
    '',
    Object.keys(authenticators).map((name) => authenticators[name])
  );
  app.use(koaParseBody());
  await middleware.activate();
  app.use(middleware.handle.bind(middleware));
  const server = app.listen(faker.datatype.number({ min: 20000, max: 30000 }));
  return server;
};

describe('Test auth router middleware', () => {
  let stubAuthenticators: Record<
    string,
    sinon.StubbedInstance<BaseAuthenticator<any>>
  >;
  let server: Server;

  beforeAll(() => {
    const a1 = sinon.stubInterface<BaseAuthenticator<any>>();
    a1.getExtensionId.returns('a1');
    a1.getTokenInfo.resolves({ token: 'a1-token' });

    const a2 = sinon.stubInterface<BaseAuthenticator<any>>();
    a2.getExtensionId.returns('a2');
    a2.getTokenInfo.resolves({ token: 'a2-token' });

    stubAuthenticators = {
      a1: a1,
      a2: a2,
    };
  });
  afterEach(() => {
    server?.close();
    sinon.default.restore();
  });

  it.each([[{}], [undefined]])(
    'Should throw error when options = %p',
    async (options) => {
      // Arrange
      const expected = new Error(
        'please set at least one auth type and user credential when you enable the "auth" options, currently support types: "".'
      );

      // Act
      const middleware = new AuthRouterMiddleware({ options: options }, '', []);

      const activateFunc = async () => await middleware.activate();

      expect(activateFunc).rejects.toThrow(expected);
    }
  );

  it('Should active corresponding authenticator when activate middleware', async () => {
    // Arrange
    const middleware = new AuthRouterMiddleware(
      {
        options: {
          a1: {},
          a2: {},
        },
      },
      '',
      Object.keys(stubAuthenticators).map((name) => stubAuthenticators[name])
    );

    // Act
    await middleware.activate();

    // Assert
    expect(stubAuthenticators['a1'].activate?.called).toBeTruthy();
    expect(stubAuthenticators['a2'].activate?.called).toBeTruthy();
  });

  it('Should failed when activate with non-supported authenticator id "m1"', async () => {
    // Arrange
    const expected = new Error(
      `The auth type "m1" in options not supported, authenticator only supported ${Object.keys(
        stubAuthenticators
      )}.`
    );

    const middleware = new AuthRouterMiddleware(
      { options: { a1: {}, m1: {} } },
      '',
      Object.keys(stubAuthenticators).map((name) => stubAuthenticators[name])
    );

    // Act
    const activate = middleware.activate();
    expect(activate).rejects.toThrowError(expected);
  });

  it('Should show status 404 when request POST /auth/token but disable the auth route middleware', async () => {
    // Arrange
    server = await runServer({ enabled: false }, stubAuthenticators);

    // Act
    const request = supertest(server).post('/auth/token');

    const response = await request;
    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it.each([
    ['a1', 'a1-token'],
    ['a2', 'a2-token'],
  ])(
    'Should get correct result when request POST /auth/token',
    async (name, expected) => {
      // Arrange
      server = await runServer(
        { options: { a1: {}, a2: {} } },
        stubAuthenticators
      );

      // Act
      const request = supertest(server)
        .post('/auth/token')
        .send({ type: name })
        .set('Accept', 'application/json');
      const response = await request;
      // Assert
      expect(response.body).toEqual({ token: expected });
    }
  );

  it('Should failed when request POST /auth/token but not contains any data', async () => {
    // Arrange
    const options = { options: { a1: {}, a2: {} } };
    const expected = {
      message: `Please provide request parameters.`,
    };
    server = await runServer(options, stubAuthenticators);

    // Act
    const request = supertest(server).post('/auth/token');
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
  });

  it('Should failed when request POST /auth/token but not contains "type" field', async () => {
    // Arrange
    const options = { options: { a1: {}, a2: {} } };
    const expected = {
      message: `Please provide auth "type", supported types: ${Object.keys(
        options['options']
      )}.`,
    };
    server = await runServer(options, stubAuthenticators);

    // Act
    const request = supertest(server)
      .post('/auth/token')
      .send({ 'other-field': '' })
      .set('Accept', 'application/json');
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
  });

  it('Should failed when request POST /auth/token with "m1" type but "m1" not setup in "auth" options', async () => {
    // Arrange
    const options = { options: { a1: {}, a2: {} } };
    const expected = {
      message: `auth type "m1" does not support, only supported: ${Object.keys(
        options['options']
      )}.`,
    };
    server = await runServer(options, stubAuthenticators);

    // Act
    const request = supertest(server)
      .post('/auth/token')
      .send({ type: 'm1' })
      .set('Accept', 'application/json');
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
  });

  it('Should failed when request POST /auth/token with "a3" type but get token "a3" failed', async () => {
    // Arrange
    const error = new Error('please provide "token"');
    const expected = {
      message: error.message,
    };
    const stubAuthenticator = sinon.stubInterface<BaseAuthenticator<any>>();
    stubAuthenticator.getTokenInfo.rejects(error);
    stubAuthenticator.getExtensionId.returns('a3');
    server = await runServer(
      { options: { a3: {} } },
      {
        a3: stubAuthenticator,
      }
    );

    // Act
    const request = supertest(server)
      .post('/auth/token')
      .send({ type: 'a3' })
      .set('Accept', 'application/json');
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
  });

  it('Should failed when request GET /auth/user-profile with "basic" token but not authenticate', async () => {
    // Arrange
    const expected = 'User profile not found.';

    const stubBasic = sinon.stubInterface<BasicAuthenticator>();
    stubBasic.getExtensionId.returns('basic');

    server = await runServer(
      { options: { basic: {} } },
      {
        basic: stubBasic,
      }
    );
    // Act
    const request = supertest(server)
      .get('/auth/user-profile')
      .set('Authorization', 'basic dXNlcjE6dGVzdDE=');
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({
      message: expected,
    });
  });

  it('Should success when request GET /auth/user-profile with "basic" token and authenticated', async () => {
    // Arrange
    const expected = {
      name: 'user1',
      attr: {
        role: 'admin',
      },
    };

    const stubBasic = sinon.stubInterface<BasicAuthenticator>();
    stubBasic.getExtensionId.returns('basic');
    stubBasic.authCredential.resolves({
      status: AuthStatus.SUCCESS,
      type: 'basic',
      user: expected,
    } as AuthResult);

    const app = new Koa();
    const authRoute = new AuthRouterMiddleware({ options: { basic: {} } }, '', [
      stubBasic,
    ]);
    const authCredential = new AuthCredentialsMiddleware(
      { options: { basic: {} } },
      '',
      [stubBasic],
      new ProjectOptions()
    );
    app.use(koaParseBody());
    await authCredential.activate();
    await authRoute.activate();
    app.use(authCredential.handle.bind(authCredential));
    app.use(authRoute.handle.bind(authRoute));
    server = app.listen(faker.datatype.number({ min: 20000, max: 30000 }));

    // Act
    const request = supertest(server)
      .get('/auth/user-profile')
      .set('Authorization', 'basic dXNlcjE6dGVzdDE=');
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual(expected);
  });
});
