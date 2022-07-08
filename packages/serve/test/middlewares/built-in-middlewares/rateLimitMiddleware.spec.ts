import faker from '@faker-js/faker';
import * as supertest from 'supertest';
import { Server } from 'http';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import {
  RateLimitMiddleware,
  RateLimitOptions,
} from '@vulcan/serve/middleware';

// Should use koa app and supertest for testing, because it will call koa context method in ratelimit middleware.
describe('Test rate limit middlewares', () => {
  let server: Server;
  beforeAll(() => {
    const app = new Koa();
    const router = new KoaRouter();
    const middleware = new RateLimitMiddleware({
      'rate-limit': {
        options: {
          max: 2,
          interval: 2000,
        } as RateLimitOptions,
      },
    });
    // use middleware in koa app
    app.use(middleware.handle.bind(middleware));
    router.get('/', (ctx) => {
      ctx.response.body = {
        result: 'ok',
      };
    });
    app.use(router.routes());
    // Act
    server = app.listen(faker.internet.port());
  });

  afterAll(() => {
    server.close();
  });

  it.each([
    { index: 1, expected: { code: 200, data: { result: 'ok' } } },
    { index: 2, expected: { code: 200, data: { result: 'ok' } } },
    {
      index: 3,
      expected: {
        code: 429,
        data: { message: 'Too many requests, please try again later.' },
      },
    },
  ])(
    'Should get status code "$expected.code" when send $index th request ',
    async ({ expected }) => {
      // Arrange
      const request = supertest(server).get('/');
      // Act
      const response = await request;

      // Assert
      expect(response.statusCode).toEqual(expected.code);
      expect(response.body).toEqual(expected.data);
    }
  );
});
