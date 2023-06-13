import { IBuildOptions, VulcanBuilder } from '@vulcan-sql/build';
import { ServeConfig, VulcanServer } from '@vulcan-sql/serve';
import * as supertest from 'supertest';
import * as md5 from 'md5';
import defaultConfig from './projectConfig';

let server: VulcanServer;

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

afterEach(async () => {
  await server.close();
});

it.each([...users])(
  'Example 2: authenticate user identity by POST /auth/token API',
  async ({ name, password }) => {
    // Arrange
    const projectConfig: ServeConfig & IBuildOptions = {
      ...defaultConfig,
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
    const expected = Buffer.from(`${name}:${password}`).toString('base64');
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];
    // Act
    const agent = supertest(httpServer);
    const result = await agent
      .post('/auth/token')
      .send({
        type: 'basic',
        username: name,
        password: password,
      })
      .set('Accept', 'application/json');
    // Assert
    expect(result.body).toEqual({
      token: expected,
    });
  },
  10000
);
