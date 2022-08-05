import { VulcanBuilder, IBuildOptions } from '@vulcan-sql/build';
import { VulcanServer, ServeConfig, APIProviderType } from '@vulcan-sql/serve';
import * as path from 'path';
import * as supertest from 'supertest';

const projectConfig: ServeConfig & IBuildOptions = {
  name: 'example project 1',
  description: 'Vulcan project for integration testing',
  version: '0.0.1',
  template: {
    provider: 'LocalFile',
    folderPath: path.resolve(__dirname, 'sqls'),
  },
  artifact: {
    provider: 'LocalFile',
    serializer: 'JSON',
    filePath: path.resolve(__dirname, 'result.json'),
  },
  'schema-parser': {
    reader: 'LocalFile',
    folderPath: path.resolve(__dirname, 'sqls'),
  },
  'document-generator': {
    specs: ['oas3'],
    folderPath: __dirname,
  },
  types: [APIProviderType.RESTFUL],
  executor: {
    type: 'pg-mem',
  },
  extensions: {
    mockEx: path.resolve(__dirname, '..', 'mockExtensions'),
  },
  'rate-limit': {
    options: { interval: { min: 1 }, max: 10000 },
  },
};

let server: VulcanServer;

afterEach(async () => {
  await server.close();
});

it('Example1: Build and serve should work', async () => {
  const builder = new VulcanBuilder();
  await builder.build(projectConfig);
  server = new VulcanServer(projectConfig);
  const httpServer = await server.start(3000);

  const agent = supertest(httpServer);
  const result = await agent.get(
    '/user?id=436193eb-f686-4105-ad7b-b5945276c14a'
  );
  expect(result.body).toContainEqual({
    id: '436193eb-f686-4105-ad7b-b5945276c14a',
    name: 'ivan',
  });
}, 10000);
