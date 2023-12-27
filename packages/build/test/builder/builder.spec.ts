import { VulcanBuilder } from '../../src';
import * as path from 'path';
import {
  IBuildOptions,
  PackagerType,
  PackagerTarget,
  SchemaReaderType,
} from '@vulcan-sql/build/models';
import {
  ArtifactBuilderProviderType,
  ArtifactBuilderSerializerType,
  DocumentSpec,
  TemplateProviderType,
} from '@vulcan-sql/api-layer';

describe('Test VulcanBuilder', () => {
  it('Should build successfully', async () => {
    // Arrange
    process.chdir(__dirname);
    const options: IBuildOptions = {
      'schema-parser': {
        reader: SchemaReaderType.LocalFile,
        folderPath: 'source/valid',
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
        folderPath: 'source/valid',
      },
      profiles: [path.resolve(__dirname, 'profile.yaml')],
    };
    const builder = new VulcanBuilder(options);

    // Act, Assert
    const packageOptions = {
      output: PackagerType.Node,
      target: PackagerTarget.VulcanServer,
    };
    await expect(builder.build(packageOptions)).resolves.not.toThrow();
  });

  it('Should build failed when duplicate urlPath existed in schemas', async () => {
    // Arrange
    process.chdir(__dirname);
    const options: IBuildOptions = {
      'schema-parser': {
        reader: SchemaReaderType.LocalFile,
        folderPath: 'source/invalid',
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
        folderPath: 'source/invalid',
      },
      profiles: [path.resolve(__dirname, 'profile.yaml')],
    };
    const builder = new VulcanBuilder(options);

    // Act, Assert
    const packageOptions = {
      output: PackagerType.Node,
      target: PackagerTarget.VulcanServer,
    };
    await expect(builder.build(packageOptions)).rejects.toThrow(
      'Duplicate "urlPath" found in schemas, please check your definition of each schemas.'
    );
  });
});
