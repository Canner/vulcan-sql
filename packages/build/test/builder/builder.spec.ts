import { VulcanBuilder } from '../../src';
import * as path from 'path';
import { IBuildOptions, SchemaReaderType } from '@vulcan/build/models';
import {
  PersistentStoreType,
  SerializerType,
  TemplateProviderType,
} from '@vulcan/core';

it('Builder.build should work', async () => {
  // Arrange
  const builder = new VulcanBuilder();
  const options: IBuildOptions = {
    schemaParser: {
      reader: SchemaReaderType.LocalFile,
      folderPath: path.resolve(__dirname, 'source'),
    },
    artifact: {
      provider: PersistentStoreType.LocalFile,
      serializer: SerializerType.JSON,
      filePath: path.resolve(__dirname, 'result.json'),
    },
    template: {
      provider: TemplateProviderType.LocalFile,
      folderPath: path.resolve(__dirname, 'source'),
    },
    extensions: [],
  };

  // Act, Assert
  await expect(builder.build(options)).resolves.not.toThrow();
});
