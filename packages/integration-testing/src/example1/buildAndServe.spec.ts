import { VulcanBuilder, IBuildOptions } from '@vulcan-sql/build';
import { VulcanServer, ServeConfig, APIProviderType } from '@vulcan-sql/serve';
import * as path from 'path';

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
};

it('Example1: Build and server should work', async () => {
  const builder = new VulcanBuilder();
  await builder.build(projectConfig);
  const server = new VulcanServer(projectConfig);
  await server.start(3000);
  await server.close();
}, 10000);
