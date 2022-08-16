import { VulcanServer } from '../src/lib/server';
import * as path from 'path';
import { APIProviderType } from '@vulcan-sql/serve';
import faker from '@faker-js/faker';
import {
  ArtifactBuilderProviderType,
  ArtifactBuilderSerializerType,
} from '@vulcan-sql/core';

let server: VulcanServer;

afterEach(async () => {
  await server?.close();
});

it('Vulcan server should work with built artifacts', async () => {
  // Arrange
  server = new VulcanServer({
    artifact: {
      provider: ArtifactBuilderProviderType.LocalFile,
      serializer: ArtifactBuilderSerializerType.JSON,
      filePath: path.resolve(__dirname, 'result.json'),
    },
    extensions: {},
    types: [APIProviderType.RESTFUL],
  });

  // Act, Assert
  await expect(
    server.start(faker.datatype.number({ min: 20000, max: 30000 }))
  ).resolves.not.toThrow();
});
