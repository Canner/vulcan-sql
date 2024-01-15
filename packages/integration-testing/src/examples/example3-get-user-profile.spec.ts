import { IBuildOptions, VulcanBuilder } from '@vulcan-sql/build';
import { ServeConfig, VulcanServer } from '@vulcan-sql/serve';
import * as supertest from 'supertest';
import defaultConfig from './projectConfig';
import md5 = require('md5');

describe('Example3: get user profile by GET /auth/user-profile API with Authorization', () => {
  let server: VulcanServer;
  let projectConfig: ServeConfig & IBuildOptions;

  const users = [
    {
      name: 'william',
      password: 'test1',
      attr: {
        role: 'admin',
      },
    },
    {
      name: 'ivan',
      password: 'test2',
      attr: {
        role: 'engineer',
      },
    },
  ];

  beforeEach(async () => {
    projectConfig = {
      ...defaultConfig,
      containerPlatform: 'linux/amd64',
      shouldPull: false,
      isWatchMode: false,
      shouldPrepareVulcanEngine: false,
      auth: {
        enabled: true,
        options: {
          basic: {
            'users-list': [
              {
                name: users[0].name,
                md5Password: md5(users[0].password),
                attr: users[0].attr,
              },
              {
                name: users[1].name,
                md5Password: md5(users[1].password),
                attr: users[1].attr,
              },
            ],
          },
        },
      },
    };
  });

  afterEach(async () => {
    await server?.close();
  });

  it.each([...users])(
    'Example 3-1: set Authorization in header with default options',
    async ({ name, password, attr }) => {
      const builder = new VulcanBuilder(projectConfig);
      await builder.build();
      server = new VulcanServer(projectConfig);
      const httpServer = (await server.start())['http'];

      const agent = supertest(httpServer);
      const result = await agent
        .get('/auth/user-profile')
        .set(
          'Authorization',
          `basic ${Buffer.from(`${name}:${password}`).toString('base64')}`
        );
      expect(result.body).toEqual({
        name,
        attr,
      });
    },
    10000
  );

  it.each([...users])(
    'Example 3-2: set Authorization in querying with default options',
    async ({ name, password, attr }) => {
      const builder = new VulcanBuilder(projectConfig);
      await builder.build();
      server = new VulcanServer(projectConfig);
      const httpServer = (await server.start())['http'];

      const auth = Buffer.from(
        JSON.stringify({
          Authorization: `basic ${Buffer.from(`${name}:${password}`).toString(
            'base64'
          )}`,
        })
      ).toString('base64');

      const agent = supertest(httpServer);
      const result = await agent.get(`/auth/user-profile?auth=${auth}`);

      expect(result.body).toEqual({
        name,
        attr,
      });
    },
    10000
  );

  it.each([...users])(
    'Example 3-3: set Authorization in querying with specific auth "key" options',
    async ({ name, password, attr }) => {
      projectConfig['auth-source'] = {
        options: {
          key: 'x-auth',
        },
      };
      const builder = new VulcanBuilder(projectConfig);
      await builder.build();
      server = new VulcanServer(projectConfig);
      const httpServer = (await server.start())['http'];

      const auth = Buffer.from(
        JSON.stringify({
          Authorization: `basic ${Buffer.from(`${name}:${password}`).toString(
            'base64'
          )}`,
        })
      ).toString('base64');

      const agent = supertest(httpServer);
      const result = await agent.get(`/auth/user-profile?x-auth=${auth}`);

      expect(result.body).toEqual({
        name,
        attr,
      });
    },
    10000
  );

  it.each([...users])(
    'Example 3-4: set Authorization in json payload specific auth "x-key" options',
    async ({ name, password, attr }) => {
      projectConfig['auth-source'] = {
        options: {
          key: 'x-auth',
          in: 'payload',
        },
      };
      const builder = new VulcanBuilder(projectConfig);
      await builder.build();
      server = new VulcanServer(projectConfig);
      const httpServer = (await server.start())['http'];

      const auth = Buffer.from(
        JSON.stringify({
          Authorization: `basic ${Buffer.from(`${name}:${password}`).toString(
            'base64'
          )}`,
        })
      ).toString('base64');

      const agent = supertest(httpServer);

      const result = await agent
        .get('/auth/user-profile')
        .send({
          ['x-auth']: auth,
        })
        .set('Accept', 'application/json');

      expect(result.body).toEqual({
        name,
        attr,
      });
    },
    10000
  );
});
