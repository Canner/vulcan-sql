import { IBuildOptions, VulcanBuilder } from '@vulcan-sql/build';
import { ServeConfig, VulcanServer } from '@vulcan-sql/serve';
import * as supertest from 'supertest';
import defaultConfig from './projectConfig';

let server: VulcanServer;

const projectConfig: ServeConfig & IBuildOptions = {
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

afterEach(async () => {
  await server.close();
});

it('Example1-3: get user profile by GET /auth/user-profile API with Authorization', async () => {
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
