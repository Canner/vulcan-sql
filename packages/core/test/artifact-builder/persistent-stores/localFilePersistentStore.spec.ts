import * as path from 'path';
import {
  LocalFilePersistentStore,
  PersistentStore,
} from '@vulcan/core/artifact-builder';
import { TYPES } from '@vulcan/core/containers';
import { Container } from 'inversify';

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind(TYPES.ArtifactBuilderOptions)
    .toConstantValue({ path: path.resolve(__dirname, 'test.json') });
  container
    .bind(TYPES.PersistentStore)
    .to(LocalFilePersistentStore)
    .inSingletonScope();
});

it('Should persist data to file', async () => {
  // Arrange
  const ps = container.get<PersistentStore>(TYPES.PersistentStore);
  const data = Buffer.from('Hello World');
  // Act, Assert
  await expect(ps.save(data)).resolves.not.toThrow();
});

it('Should load persisted data from file with correct data', async () => {
  // Arrange
  const ps = container.get<PersistentStore>(TYPES.PersistentStore);
  const data = Buffer.from('Hello World');
  await ps.save(data);
  // Act
  const loadedData = await ps.load();
  // Assert
  expect(loadedData.toString()).toEqual('Hello World');
});
