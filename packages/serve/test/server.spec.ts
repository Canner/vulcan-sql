import { VulcanServer } from '../src/lib/server';
import * as path from 'path';
import { APIProviderType } from '@vulcan-sql/serve';
import faker from '@faker-js/faker';
import {
  ArtifactBuilderProviderType,
  ArtifactBuilderSerializerType,
} from '@vulcan-sql/core';

describe('Test VulcanServer', () => {
  let server: VulcanServer;

  afterEach(async () => {
    await server?.close();
  });

  it('Should work with built artifacts', async () => {
    // Arrange
    server = new VulcanServer({
      port: faker.datatype.number({ min: 20000, max: 30000 }),
      artifact: {
        provider: ArtifactBuilderProviderType.LocalFile,
        serializer: ArtifactBuilderSerializerType.JSON,
        filePath: path.resolve(__dirname, 'valid-result.json'),
      },
      extensions: {},
      types: [APIProviderType.RESTFUL],
      'enforce-https': {
        enabled: false,
      },
      auth: {
        enabled: false,
      },
    });

    // Act, Assert
    await expect(server.start()).resolves.not.toThrow();
  });

  it('Should work failed when duplicate urlPath exist in built artifacts ', async () => {
    // Arrange
    server = new VulcanServer({
      port: faker.datatype.number({ min: 20000, max: 30000 }),
      artifact: {
        provider: ArtifactBuilderProviderType.LocalFile,
        serializer: ArtifactBuilderSerializerType.JSON,
        filePath: path.resolve(__dirname, 'invalid-result.json'),
      },
      extensions: {},
      types: [APIProviderType.RESTFUL],
      'enforce-https': {
        enabled: false,
      },
      auth: {
        enabled: false,
      },
    });

    // Act, Assert
    await expect(server.start()).rejects.toThrow(
      'Duplicate "urlPath" found in "schemas" field of artifact, please check your artifact or original schemas before running build.'
    );
  });
});
