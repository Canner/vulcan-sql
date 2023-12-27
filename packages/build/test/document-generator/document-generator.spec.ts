import { SpecGenerator } from '@vulcan-sql/build';
import { DocumentGenerator } from '@vulcan-sql/build/doc-generator';
import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import { ArtifactBuilder } from '@vulcan-sql/api-layer';

it('Document generator should write YAML files while generating documents', async () => {
  // Arrange
  const mockSpec = {
    someSpec: faker.datatype.number(),
    profile: faker.name.firstName(),
  };
  const mockArtifactBuilder = sinon.stubInterface<ArtifactBuilder>();
  const documentGenerator = new DocumentGenerator(
    (id: string) => {
      const mockSpecGenerator = sinon.stubInterface<SpecGenerator>();
      mockSpecGenerator.getSpec.returns(mockSpec);
      mockSpecGenerator.getExtensionId.returns(id);
      return mockSpecGenerator;
    },
    {
      specs: ['spec1', 'spec2'],
      router: [],
    },
    mockArtifactBuilder
  );

  // Act
  await documentGenerator.generateDocuments([]);

  // Arrange
  expect(mockArtifactBuilder.addArtifact.firstCall.args[1]).toEqual({
    spec1: mockSpec,
    spec2: mockSpec,
  });
});
