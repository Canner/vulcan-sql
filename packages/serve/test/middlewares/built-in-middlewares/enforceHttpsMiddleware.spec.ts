import faker from '@faker-js/faker';
import * as supertest from 'supertest';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import {
  EnforceHttpsOptions,
  EnforceHttpsMiddleware,
  ResolverType,
} from '@vulcan-sql/serve/middleware';
import { ServeConfig } from '@vulcan-sql/serve/models';
import { Server } from 'http';

const runServer = (config: Omit<ServeConfig, 'artifact' | 'template'>) => {
  // Arrange
  const port = faker.datatype.number({ min: 20000, max: 30000 });
  const app = new Koa();
  const router = new KoaRouter();
  const middleware = new EnforceHttpsMiddleware(config['enforce-https'], '');
  // use middleware in koa app
  app.use(middleware.handle.bind(middleware));
  router.get('/', (ctx) => {
    ctx.response.body = {
      result: 'ok',
    };
  });
  app.use(router.routes());
  return {
    server: app.listen(port),
    port,
  };
};

describe('Test enforce https middlewares for LOCAL resolver type', () => {
  let server: Server;
  afterEach(() => {
    server?.close();
  });
  it('Should get status code "301" when send GET request', async () => {
    // Arrange
    server = runServer({}).server;

    const request = supertest(server).get('/');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(301);
    expect(response.body).toEqual({});
  });

  it('Should get status code "405" when send POST request', async () => {
    // Arrange
    server = runServer({}).server;
    const request = supertest(server).post('/');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(405);
    expect(response.body).toEqual({});
  });

  it('Should get status code "301" when config allow POST redirect', async () => {
    // Arrange
    server = runServer({
      'enforce-https': {
        options: {
          redirectMethods: ['POST'],
        } as EnforceHttpsOptions,
      },
    }).server;

    const request = supertest(server).post('/');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(301);
    expect(response.body).toEqual({});
  });
});

describe('Test enforce https middlewares for X_FORWARDED_PROTO resolver type', () => {
  let server: Server;
  afterEach(() => {
    server?.close();
  });
  it('Should get status code "301" when send GET request', async () => {
    // Arrange
    server = runServer({
      'enforce-https': {
        options: {
          type: ResolverType.X_FORWARDED_PROTO.toString(),
        } as EnforceHttpsOptions,
      },
    }).server;

    const request = supertest(server).get('/');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(301);
    expect(response.body).toEqual({});
  });

  it('Should get status code "200" when send GET request with "x-forwarded-proto: https"', async () => {
    // Arrange
    server = runServer({
      'enforce-https': {
        options: {
          type: ResolverType.X_FORWARDED_PROTO.toString(),
        } as EnforceHttpsOptions,
      },
    }).server;

    const request = supertest(server)
      .get('/')
      .set('x-forwarded-proto', 'https');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ result: 'ok' });
  });
});

describe('Test enforce https middlewares for AZURE_ARR resolver type', () => {
  let server: Server;
  afterEach(() => {
    server?.close();
  });
  it('Should get status code "301" when send GET request', async () => {
    // Arrange
    server = runServer({
      'enforce-https': {
        options: {
          type: ResolverType.AZURE_ARR.toString(),
        } as EnforceHttpsOptions,
      },
    }).server;

    const request = supertest(server).get('/');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(301);
    expect(response.body).toEqual({});
  });

  it('Should get status code "200" when send GET request with "x-arr-ssl: https"', async () => {
    // Arrange
    server = runServer({
      'enforce-https': {
        options: {
          type: ResolverType.AZURE_ARR.toString(),
        } as EnforceHttpsOptions,
      },
    }).server;

    const request = supertest(server).get('/').set('x-arr-ssl', 'https');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ result: 'ok' });
  });
});

describe('Test enforce https middlewares for CUSTOM resolver type', () => {
  let server: Server;
  afterEach(() => {
    server?.close();
  });
  it('Should throw error when not set proto in options', async () => {
    // Arrange
    const config = {
      'enforce-https': {
        options: {
          type: ResolverType.CUSTOM.toString(),
        } as EnforceHttpsOptions,
      },
    };
    // Act
    const runAction = () => runServer(config);
    // Assert
    expect(runAction).toThrow(
      'The "CUSTOM" type need also provide "proto" in options.'
    );
  });
  it('Should get status code "301" when send GET request', async () => {
    // Arrange
    server = runServer({
      'enforce-https': {
        options: {
          type: ResolverType.CUSTOM.toString(),
          proto: 'x-custom-proto',
        } as EnforceHttpsOptions,
      },
    }).server;

    const request = supertest(server).get('/');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(301);
    expect(response.body).toEqual({});
  });

  it('Should get status code "200" when send GET request with "x-custom-proto: https"', async () => {
    // Arrange
    server = runServer({
      'enforce-https': {
        options: {
          type: ResolverType.CUSTOM.toString(),
          proto: 'x-custom-proto',
        } as EnforceHttpsOptions,
      },
    }).server;

    const request = supertest(server).get('/').set('x-custom-proto', 'https');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ result: 'ok' });
  });
});

describe('Test enforce https middlewares for FORWARDED resolver type', () => {
  let server: Server;
  afterEach(() => {
    server?.close();
  });
  it('Should get status code "301" when send GET request', async () => {
    // Arrange
    server = runServer({
      'enforce-https': {
        options: {
          type: ResolverType.FORWARDED.toString(),
        } as EnforceHttpsOptions,
      },
    }).server;

    const request = supertest(server).get('/');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(301);
    expect(response.body).toEqual({});
  });

  it('Should get status code "200" when send GET request with "forwarded: by=foo;for=baz;host=localhost;proto=https', async () => {
    // Arrange
    server = runServer({
      'enforce-https': {
        options: {
          type: ResolverType.FORWARDED.toString(),
        } as EnforceHttpsOptions,
      },
    }).server;

    const request = supertest(server)
      .get('/')
      .set('forwarded', 'by=foo;for=baz;host=localhost;proto=https');
    // Act
    const response = await request;

    // Assert
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ result: 'ok' });
  });
});
