import { VulcanBuilder } from '../../src';
import * as path from 'path';
import {
  IBuildOptions,
  PackagerType,
  SchemaReaderType,
} from '@vulcan-sql/build/models';
import {
  ArtifactBuilderProviderType,
  ArtifactBuilderSerializerType,
  DocumentSpec,
  TemplateProviderType,
} from '@vulcan-sql/core';

it('Builder.build should work', async () => {
  // Arrange
  process.chdir(__dirname);
  const options: IBuildOptions = {
    'schema-parser': {
      reader: SchemaReaderType.LocalFile,
      folderPath: 'source',
    },
    document: {
      specs: [DocumentSpec.oas3],
    },
    artifact: {
      provider: ArtifactBuilderProviderType.LocalFile,
      serializer: ArtifactBuilderSerializerType.JSON,
      filePath: 'result.json',
    },
    template: {
      provider: TemplateProviderType.LocalFile,
      folderPath: 'source',
    },
    profiles: [path.resolve(__dirname, 'profile.yaml')],
  };
  const builder = new VulcanBuilder(options);

  // Act, Assert
  await expect(builder.build(PackagerType.Node)).resolves.not.toThrow();
});
