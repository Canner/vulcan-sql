import {
  ArtifactBuilder,
  BuiltInArtifactKeys,
} from '@vulcan-sql/api-layer/artifact-builder';
import { Container, TYPES } from '@vulcan-sql/api-layer/containers';
import { TemplateEngine } from '@vulcan-sql/api-layer/template-engine';
import * as path from 'path';
import * as fs from 'fs';
import {
  ArtifactBuilderProviderType,
  ArtifactBuilderSerializerType,
  TemplateProviderType,
} from '@vulcan-sql/api-layer/models';

it('Container should load options and resolve all dependencies', async () => {
  // Arrange
  const resultPath = path.resolve(__dirname, 'result.json');
  if (fs.existsSync(resultPath)) {
    fs.unlinkSync(resultPath);
  }
  const container = new Container();
  await container.load({
    artifact: {
      provider: ArtifactBuilderProviderType.LocalFile,
      filePath: resultPath,
      serializer: ArtifactBuilderSerializerType.JSON,
    },
    template: {
      provider: TemplateProviderType.LocalFile,
      folderPath: path.resolve(__dirname, 'test-template'),
    },
    extensions: {},
  });
  // Act
  const templateEngine = container.get<TemplateEngine>(TYPES.TemplateEngine);
  const artifactBuilder = container.get<ArtifactBuilder>(TYPES.ArtifactBuilder);
  const { templates } = await templateEngine.compile();
  artifactBuilder.addArtifact(BuiltInArtifactKeys.Templates, templates);
  await artifactBuilder.build();
  await container.unload();
  // Assert
  expect(fs.existsSync(resultPath)).toBeTruthy();
});
