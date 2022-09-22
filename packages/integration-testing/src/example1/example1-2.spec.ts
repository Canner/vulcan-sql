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

it('Example1-2: authenticate user identity by POST /auth/token API', async () => {
  const builder = new VulcanBuilder(projectConfig);
  await builder.build();
  server = new VulcanServer(projectConfig);
  const httpServer = (await server.start())['http'];

  const agent = supertest(httpServer);
  const result = await agent
    .post('/auth/token')
    .send({
      type: 'basic',
      username: 'user1',
      password: 'test1',
    })
    .set('Accept', 'application/json');
  expect(result.body).toEqual({
    token: 'dXNlcjE6dGVzdDE=',
  });
}, 10000);
