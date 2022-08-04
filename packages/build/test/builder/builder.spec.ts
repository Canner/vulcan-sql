import { VulcanBuilder } from '../../src';
import * as path from 'path';
import { IBuildOptions, SchemaReaderType } from '@vulcan-sql/build/models';

it('Builder.build should work', async () => {
  // Arrange
  const builder = new VulcanBuilder();
  const options: IBuildOptions = {
    schemaParser: {
      reader: SchemaReaderType.LocalFile,
      folderPath: path.resolve(__dirname, 'source'),
    },
    artifact: {
      provider: 'LocalFile',
      serializer: 'JSON',
      filePath: path.resolve(__dirname, 'result.json'),
    },
    template: {
      provider: 'LocalFile',
      folderPath: path.resolve(__dirname, 'source'),
    },
    extensions: {},
  };

  // Act, Assert
  await expect(builder.build(options)).resolves.not.toThrow();
});
