import { ArtifactBuilder } from '@vulcan-sql/core/artifact-builder';
import { Container, TYPES } from '@vulcan-sql/core/containers';
import { TemplateEngine } from '@vulcan-sql/core/template-engine';
import * as path from 'path';
import * as fs from 'fs';

it('Container should load options and resolve all dependencies', async () => {
  // Arrange
  const resultPath = path.resolve(__dirname, 'result.json');
  if (fs.existsSync(resultPath)) {
    fs.unlinkSync(resultPath);
  }
  const container = new Container();
  await container.load({
    artifact: {
      provider: 'LocalFile',
      filePath: resultPath,
      serializer: 'JSON',
    },
    template: {
      provider: 'LocalFile',
      folderPath: path.resolve(__dirname, 'test-template'),
    },
    extensions: {},
  });
  // Act
  const templateEngine = container.get<TemplateEngine>(TYPES.TemplateEngine);
  const artifactBuilder = container.get<ArtifactBuilder>(TYPES.ArtifactBuilder);
  const { templates } = await templateEngine.compile();
  await artifactBuilder.build({ templates, schemas: [] });
  await container.unload();
  // Assert
  expect(fs.existsSync(resultPath)).toBeTruthy();
});
