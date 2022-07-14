import {
  Artifact,
  JSONSerializer,
  LocalFilePersistentStore,
  VulcanArtifactBuilder,
} from '@vulcan-sql/core/artifact-builder';
import { Container } from 'inversify';
import { TYPES } from '@vulcan-sql/core/containers';
import * as sinon from 'ts-sinon';

let container: Container;
let mockPersistentStore: sinon.StubbedInstance<LocalFilePersistentStore>;

const mockArtifact: Artifact = {
  schemas: [],
  templates: {},
};

beforeEach(() => {
  container = new Container();
  mockPersistentStore = sinon.stubInterface();

  container
    .bind(TYPES.Factory_PersistentStore)
    .toConstantValue(() => mockPersistentStore);
  container
    .bind(TYPES.Factory_Serializer)
    .toConstantValue(() => new JSONSerializer());

  container.bind(TYPES.ArtifactBuilderOptions).toConstantValue({});
  container.bind(TYPES.ArtifactBuilder).to(VulcanArtifactBuilder);
});

it('Should pass serialized data to store while building', async () => {
  // Arrange
  const builder = container.get<VulcanArtifactBuilder>(TYPES.ArtifactBuilder);

  // Act
  await builder.build(mockArtifact);

  // Assert
  expect(mockPersistentStore.save.calledOnce).toBe(true);
});

it('Should load deserialized data while loading', async () => {
  // Arrange
  const builder = container.get<VulcanArtifactBuilder>(TYPES.ArtifactBuilder);
  mockPersistentStore.load.resolves(Buffer.from(JSON.stringify(mockArtifact)));

  // Act
  const artifact = await builder.load();

  // Assert
  expect(artifact).toEqual(mockArtifact);
});
