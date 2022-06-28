import { BuildPipeline } from '../../src';
import * as path from 'path';
import {
  LocalFilePersistentStore,
  TemplateEngine,
  VulcanArtifactBuilder,
} from '@vulcan/core';

it('Default pipeline should build artifacts correctly', async () => {
  // Arrange
  const pipeline = BuildPipeline.default({
    sourceFolderPath: path.resolve(__dirname, 'source'),
    destinationFilePath: path.resolve(__dirname, 'result.json'),
  });
  // Act, Assert
  await expect(pipeline.build()).resolves.not.toThrow();
});

// TODO: this test should be moved to serve package
// TODO: Wait for correct context format
it('Default pipeline should load the built artifacts correctly', async () => {
  // Arrange
  const pipeline = BuildPipeline.default({
    sourceFolderPath: path.resolve(__dirname, 'source'),
    destinationFilePath: path.resolve(__dirname, 'result.json'),
  });
  await pipeline.build();
  // Act, Assert
  const ps = new LocalFilePersistentStore({
    filePath: path.resolve(__dirname, 'result.json'),
  });
  const artifactBuilder = new VulcanArtifactBuilder({ persistentStore: ps });
  const { templates } = await artifactBuilder.load();
  const templateEngine = TemplateEngine.useDefaultLoader({
    compiledResult: { templates },
  });
  const query = await templateEngine.render('user', {
    context: { params: { id: '7c245513-823e-4225-9833-b88c7652b996' } },
  });
  // Assert
  expect(query).toBe(
    `select * from public.user where id = '7c245513-823e-4225-9833-b88c7652b996';`
  );
});
