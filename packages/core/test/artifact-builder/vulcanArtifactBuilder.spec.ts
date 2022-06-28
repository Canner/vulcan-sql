import * as path from 'path';
import {
  Artifact,
  LocalFilePersistentStore,
  VulcanArtifactBuilder,
} from '@artifact-builder/.';

it('Should persist artifacts to file', async () => {
  // Arrange
  const ps = new LocalFilePersistentStore({
    filePath: path.resolve(__dirname, 'test.json'),
  });
  const build = new VulcanArtifactBuilder({
    persistentStore: ps,
  });
  const data: Artifact = {
    schemas: [],
    templates: {},
  };
  // Act, Assert
  await expect(build.build(data)).resolves.not.toThrow();
});

it('Should load persisted artifacts from file with correct data', async () => {
  // Arrange
  const ps = new LocalFilePersistentStore({
    filePath: path.resolve(__dirname, 'test.json'),
  });
  const build = new VulcanArtifactBuilder({
    persistentStore: ps,
  });
  const data: Artifact = {
    schemas: [],
    templates: {},
  };
  await build.build(data);
  // Act
  const loadedData = await build.load();
  // Assert
  expect(loadedData).toEqual(data);
});
