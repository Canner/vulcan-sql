import { ArtifactBuilder } from '@artifact-builder';
import { Container, TYPES } from '@containers';
import {
  PersistentStoreType,
  SerializerType,
  TemplateProviderType,
} from '@models';
import { TemplateEngine } from '@template-engine';
import * as path from 'path';
import * as fs from 'fs';

it('Container should load options and resolve all dependencies', async () => {
  // Arrange
  const resultPath = path.resolve(__dirname, 'result.json');
  if (fs.existsSync(resultPath)) {
    fs.unlinkSync(resultPath);
  }
  const container = new Container();
  container.load({
    artifact: {
      storageType: PersistentStoreType.LocalFile,
      path: resultPath,
      serializerType: SerializerType.JSON,
    },
    template: {
      provider: TemplateProviderType.LocalFile,
      path: path.resolve(__dirname, 'test-template'),
    },
  });
  // Act
  const templateEngine = container.get<TemplateEngine>(TYPES.TemplateEngine);
  const artifactBuilder = container.get<ArtifactBuilder>(TYPES.ArtifactBuilder);
  const { templates } = await templateEngine.compile();
  await artifactBuilder.build({ templates, schemas: [] });
  // Assert
  expect(fs.existsSync(resultPath)).toBeTruthy();
});
