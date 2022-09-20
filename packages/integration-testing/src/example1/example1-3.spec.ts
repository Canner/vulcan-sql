import { IBuildOptions, VulcanBuilder } from '@vulcan-sql/build';
import { ServeConfig, VulcanServer } from '@vulcan-sql/serve';
import * as supertest from 'supertest';
import defaultConfig from './projectConfig';

describe('Example1-3: get user profile by GET /auth/user-profile API with Authorization', () => {
  let server: VulcanServer;
  let projectConfig: ServeConfig & IBuildOptions;

  beforeEach(async () => {
    projectConfig = {
      ...defaultConfig,
      auth: {
        enabled: true,
        options: {
          basic: {
            'users-list': [
              {
                name: 'user1',
                // md5('test1')
                md5Password: '5a105e8b9d40e1329780d62ea2265d8a',
                attr: {
                  role: 'admin',
                },
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

  it('Example1-3-1: set Authorization in header with default options', async () => {
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];

    const agent = supertest(httpServer);
    const result = await agent
      .get('/auth/user-profile')
      .set('Authorization', 'basic dXNlcjE6dGVzdDE=');
    expect(result.body).toEqual({
      name: 'user1',
      attr: {
        role: 'admin',
      },
    });
  }, 10000);

  it('Example1-3-2: set Authorization in querying with default options', async () => {
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];

    const auth = Buffer.from(
      JSON.stringify({ Authorization: 'basic dXNlcjE6dGVzdDE=' })
    ).toString('base64');

    const agent = supertest(httpServer);
    const result = await agent.get(`/auth/user-profile?auth=${auth}`);

    expect(result.body).toEqual({
      name: 'user1',
      attr: {
        role: 'admin',
      },
    });
  }, 10000);

  it('Example1-3-3: set Authorization in querying with specific auth "key" options', async () => {
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
      JSON.stringify({ Authorization: 'basic dXNlcjE6dGVzdDE=' })
    ).toString('base64');

    const agent = supertest(httpServer);
    const result = await agent.get(`/auth/user-profile?x-auth=${auth}`);

    expect(result.body).toEqual({
      name: 'user1',
      attr: {
        role: 'admin',
      },
    });
  }, 10000);

  it('Example1-3-4: set Authorization in json payload specific auth "x-key" options', async () => {
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
      JSON.stringify({ Authorization: 'basic dXNlcjE6dGVzdDE=' })
    ).toString('base64');

    const agent = supertest(httpServer);

    const result = await agent
      .get('/auth/user-profile')
      .send({
        ['x-auth']: auth,
      })
      .set('Accept', 'application/json');

    expect(result.body).toEqual({
      name: 'user1',
      attr: {
        role: 'admin',
      },
    });
  }, 10000);
});
