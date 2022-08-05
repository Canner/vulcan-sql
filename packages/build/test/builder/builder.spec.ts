import { VulcanBuilder } from '../../src';
import * as path from 'path';
import { IBuildOptions } from '@vulcan-sql/build/models';

it('Builder.build should work', async () => {
  // Arrange
  const builder = new VulcanBuilder();
  const options: IBuildOptions = {
    'schema-parser': {
      reader: 'LocalFile',
      folderPath: path.resolve(__dirname, 'source'),
    },
    'document-generator': {
      specs: ['oas3'],
      folderPath: path.resolve(__dirname),
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
