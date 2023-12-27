import {
  BuiltInArtifactKeys,
  JSONSerializer,
  LocalFilePersistentStore,
  VulcanArtifactBuilder,
} from '@vulcan-sql/api-layer/artifact-builder';
import { Container } from 'inversify';
import { TYPES } from '@vulcan-sql/api-layer/types';
import * as sinon from 'ts-sinon';

let container: Container;
let mockPersistentStore: sinon.StubbedInstance<LocalFilePersistentStore>;

const mockArtifact = {
  [BuiltInArtifactKeys.Schemas]: [],
  [BuiltInArtifactKeys.Templates]: {},
};

beforeEach(() => {
  container = new Container();
  mockPersistentStore = sinon.stubInterface();

  container.bind(TYPES.PersistentStore).toConstantValue(mockPersistentStore);
  container.bind(TYPES.Serializer).toConstantValue(new JSONSerializer({}, ''));

  container.bind(TYPES.ArtifactBuilderOptions).toConstantValue({});
  container.bind(TYPES.ArtifactBuilder).to(VulcanArtifactBuilder);
});

it('Should pass serialized data to store while building', async () => {
  // Arrange
  const builder = container.get<VulcanArtifactBuilder>(TYPES.ArtifactBuilder);

  // Act
  await builder.build();

  // Assert
  expect(mockPersistentStore.save.calledOnce).toBe(true);
});

it('Should load deserialized data while loading', async () => {
  // Arrange
  const builder = container.get<VulcanArtifactBuilder>(TYPES.ArtifactBuilder);
  mockPersistentStore.load.resolves(Buffer.from(JSON.stringify(mockArtifact)));

  // Act
  await builder.load();
  const template = builder.getArtifact(BuiltInArtifactKeys.Templates);
  const schemas = builder.getArtifact(BuiltInArtifactKeys.Schemas);

  // Assert
  expect(template).toEqual(mockArtifact[BuiltInArtifactKeys.Templates]);
  expect(schemas).toEqual(mockArtifact[BuiltInArtifactKeys.Schemas]);
});
