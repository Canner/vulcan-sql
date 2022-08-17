import { VulcanBuilder } from '../../src';
import * as path from 'path';
import {
  DocumentGeneratorSpec,
  IBuildOptions,
  SchemaReaderType,
} from '@vulcan-sql/build/models';
import {
  ArtifactBuilderProviderType,
  ArtifactBuilderSerializerType,
  TemplateProviderType,
} from '@vulcan-sql/core';

it('Builder.build should work', async () => {
  // Arrange
  const builder = new VulcanBuilder();
  const options: IBuildOptions = {
    'schema-parser': {
      reader: SchemaReaderType.LocalFile,
      folderPath: path.resolve(__dirname, 'source'),
    },
    'document-generator': {
      specs: [DocumentGeneratorSpec.oas3],
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
    extensions: {},
  };

  // Act, Assert
  await expect(builder.build(options)).resolves.not.toThrow();
});
