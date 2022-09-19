import { VulcanBuilder } from '@vulcan-sql/build';
import { VulcanServer } from '@vulcan-sql/serve';
import * as supertest from 'supertest';
import projectConfig from './projectConfig';

let server: VulcanServer;

afterEach(async () => {
  await server?.close();
});

it.each([
  [
    '436193eb-f686-4105-ad7b-b5945276c14a',
    [
      {
        id: '436193eb-f686-4105-ad7b-b5945276c14a',
        name: 'ivan',
      },
    ],
  ],
  ['2dc839e0-0f65-4dba-ac38-4eaf023d0008', []],
])(
  'Example1: Build and serve should work',
  async (userId, expected) => {
    const builder = new VulcanBuilder(projectConfig);
    await builder.build();
    server = new VulcanServer(projectConfig);
    const httpServer = (await server.start())['http'];

    const agent = supertest(httpServer);
    const result = await agent.get(`/api/user/${userId}`);
    expect(JSON.stringify(result.body)).toEqual(JSON.stringify(expected));
  },
  10000
);
