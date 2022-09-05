import * as sinon from 'ts-sinon';
import * as lodash from 'lodash';
import * as Koa from 'koa';
import faker from '@faker-js/faker';
import * as supertest from 'supertest';
import { AuthRouteMiddleware } from '@vulcan-sql/serve/middleware';
import {
  AuthOptions,
  BaseAuthenticator,
  KoaContext,
} from '@vulcan-sql/serve/models';

const runServer = async (
  options: AuthOptions,
  authenticators: Record<string, sinon.StubbedInstance<BaseAuthenticator<any>>>
) => {
  const app = new Koa();
  const middleware = new AuthRouteMiddleware(
    { options: options },
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

  beforeAll(() => {
    const a1 = sinon.stubInterface<BaseAuthenticator<any>>();
    a1.getExtensionId.returns('a1');
    a1.authIdentity.resolves({ token: 'a1-token' });

    const a2 = sinon.stubInterface<BaseAuthenticator<any>>();
    a2.getExtensionId.returns('a2');
    a2.authIdentity.resolves({ token: 'a2-token' });

    stubAuthenticators = {
      a1: a1,
      a2: a2,
    };
  });
  afterEach(() => {
    sinon.default.restore();
  });

  it('Should return to stop auth middleware when enabled = false', async () => {
    // Arrange
    const ctx: KoaContext = {
      ...sinon.stubInterface<KoaContext>(),
    };
    // Act
    const middleware = new AuthRouteMiddleware(
      {
        enabled: false,
      },
      '',
      []
    );
    // spy the async function to do test
    const spy = jest.spyOn(lodash, 'isEmpty');

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(spy).not.toHaveBeenCalled();
  });

  it.each([[{}], [undefined]])(
    'Should throw error when options = %p',
    async (options) => {
      // Arrange
      const expected = new Error(
        'please set at least one auth type and user credential when you enable the "auth" options.'
      );
      const ctx: KoaContext = {
        ...sinon.stubInterface<KoaContext>(),
      };
      // Act
      const middleware = new AuthRouteMiddleware({ options: options }, '', []);

      const action = middleware.handle(ctx, async () => Promise.resolve());

      expect(action).rejects.toThrow(expected);
    }
  );

  it('Should active corresponding authenticator when activate middleware', async () => {
    // Arrange
    const middleware = new AuthRouteMiddleware(
      {},
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

  it.each([
    ['a1', 'a1-token'],
    ['a2', 'a2-token'],
  ])(
    'Should get correct result when call GET /auth?type=%p',
    async (name, expected) => {
      // Arrange
      const server = await runServer({ a1: {}, a2: {} }, stubAuthenticators);

      // Act
      const request = supertest(server).get(`/auth?type=${name}`);
      const response = await request;
      // Assert
      expect(response.body).toEqual({ token: expected });
      server.close();
    }
  );

  it('Should failed when call GET /auth but not include "type" query string', async () => {
    // Arrange
    const options = { a1: {}, a2: {} };
    const expected = {
      message: `Please indicate auth "type", supported auth types: ${Object.keys(
        options
      )}.`,
    };
    const server = await runServer(options, stubAuthenticators);

    // Act
    const request = supertest(server).get(`/auth`);
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
    server.close();
  });

  it('Should failed when call GET /auth?type=m1 but "m1" not setup in "auth" options', async () => {
    // Arrange
    const options = { a1: {}, a2: {} };
    const expected = {
      message: `auth type "m1" does not support, only supported: ${Object.keys(
        options
      )}.`,
    };
    const server = await runServer(options, stubAuthenticators);

    // Act
    const request = supertest(server).get(`/auth?type=m1`);
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
    server.close();
  });

  it('Should failed when call GET /auth?type=a3 but auth identity "a3" failed', async () => {
    // Arrange
    const error = new Error('please provide "token"');
    const expected = {
      message: error.message,
    };
    const stubAuthenticator = sinon.stubInterface<BaseAuthenticator<any>>();
    stubAuthenticator.authIdentity.rejects(error);
    stubAuthenticator.getExtensionId.returns('a3');
    const server = await runServer(
      { a3: {} },
      {
        a3: stubAuthenticator,
      }
    );

    // Act
    const request = supertest(server).get(`/auth?type=a3`);
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual(expected);
    server.close();
  });
});
