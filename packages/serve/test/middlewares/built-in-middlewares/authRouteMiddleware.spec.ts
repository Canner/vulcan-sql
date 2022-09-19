import * as sinon from 'ts-sinon';
import * as Koa from 'koa';
import faker from '@faker-js/faker';
import * as supertest from 'supertest';
import { AuthRouteMiddleware } from '@vulcan-sql/serve/middleware';
import { AuthOptions, BaseAuthenticator } from '@vulcan-sql/serve/models';
import { Server } from 'http';

const runServer = async (
  options: { enabled?: boolean; options?: AuthOptions },
  authenticators: Record<string, sinon.StubbedInstance<BaseAuthenticator<any>>>
) => {
  const app = new Koa();
  const middleware = new AuthRouteMiddleware(
    options,
    '',
    Object.keys(authenticators).map((name) => authenticators[name])
  );
  await middleware.activate();
  app.use(middleware.handle.bind(middleware));
  const server = app.listen(faker.datatype.number({ min: 20000, max: 30000 }));
  return server;
};

describe('Test auth route middleware', () => {
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
        'please set at least one auth type and user credential when you enable the "auth" options.'
      );

      // Act
      const middleware = new AuthRouteMiddleware({ options: options }, '', []);

      const activateFunc = async () => await middleware.activate();

      expect(activateFunc).rejects.toThrow(expected);
    }
  );

  it('Should active corresponding authenticator when activate middleware', async () => {
    // Arrange
    const middleware = new AuthRouteMiddleware(
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

    const middleware = new AuthRouteMiddleware(
      { options: { a1: {}, m1: {} } },
      '',
      Object.keys(stubAuthenticators).map((name) => stubAuthenticators[name])
    );

    // Act
    const activate = middleware.activate();
    expect(activate).rejects.toThrowError(expected);
  });

  it.each([['a1'], ['a2']])(
    'Should show status code 404 when call GET /auth/token',
    async (name) => {
      // Arrange
      server = await runServer({ enabled: false }, stubAuthenticators);

      // Act
      const request = supertest(server).get(`/auth/token?type=${name}`);
      const response = await request;
      // Assert
      expect(response.statusCode).toEqual(404);
    }
  );

  it.each([
    ['a1', 'a1-token'],
    ['a2', 'a2-token'],
  ])(
    'Should get correct result when call GET /auth/token?type=%p',
    async (name, expected) => {
      // Arrange
      server = await runServer(
        { options: { a1: {}, a2: {} } },
        stubAuthenticators
      );

      // Act
      const request = supertest(server).get(`/auth/token?type=${name}`);
      const response = await request;
      // Assert
      expect(response.body).toEqual({ token: expected });
    }
  );

  it('Should failed when call GET /auth/token but not include "type" query string', async () => {
    // Arrange
    const options = { options: { a1: {}, a2: {} } };
    const expected = {
      message: `Please indicate auth "type", supported auth types: ${Object.keys(
        options['options']
      )}.`,
    };
    server = await runServer(options, stubAuthenticators);

    // Act
    const request = supertest(server).get(`/auth/token`);
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
  });

  it('Should failed when call GET /auth/token?type=m1 but "m1" not setup in "auth" options', async () => {
    // Arrange
    const options = { options: { a1: {}, a2: {} } };
    const expected = {
      message: `auth type "m1" does not support, only supported: ${Object.keys(
        options['options']
      )}.`,
    };
    server = await runServer(options, stubAuthenticators);

    // Act
    const request = supertest(server).get(`/auth/token?type=m1`);
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
  });

  it('Should failed when call GET /auth/token?type=a3 but auth identity "a3" failed', async () => {
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
    const request = supertest(server).get(`/auth/token?type=a3`);
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
  });
});
