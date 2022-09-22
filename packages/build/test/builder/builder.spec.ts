import { VulcanBuilder } from '../../src';
import * as path from 'path';
import { IBuildOptions, SchemaReaderType } from '@vulcan-sql/build/models';
import {
  ArtifactBuilderProviderType,
  ArtifactBuilderSerializerType,
  DocumentSpec,
  TemplateProviderType,
} from '@vulcan-sql/core';

it('Builder.build should work', async () => {
  // Arrange
  const options: IBuildOptions = {
    'schema-parser': {
      reader: SchemaReaderType.LocalFile,
      folderPath: path.resolve(__dirname, 'source'),
    },
    document: {
      specs: [DocumentSpec.oas3],
      folderPath: path.resolve(__dirname),
    },
    artifact: {
      provider: ArtifactBuilderProviderType.LocalFile,
      serializer: ArtifactBuilderSerializerType.JSON,
      filePath: path.resolve(__dirname, 'result.json'),
    },
    template: {
      provider: TemplateProviderType.LocalFile,
      folderPath: path.resolve(__dirname, 'source'),
    },
    profiles: [path.resolve(__dirname, 'profile.yaml')],
  };
  const builder = new VulcanBuilder(options);

  // Act, Assert
  await expect(builder.build()).resolves.not.toThrow();
});
