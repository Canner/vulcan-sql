import { SpecGenerator } from '@vulcan-sql/build';
import { DocumentGenerator } from '@vulcan-sql/build/doc-generator';
import * as sinon from 'ts-sinon';
import * as path from 'path';
import { promises as fs } from 'fs';
import faker from '@faker-js/faker';

it('Document generator should write YAML files while generating documents', async () => {
  // Arrange
  const mockSpec = { someSpec: faker.datatype.number() };
  const documentGenerator = new DocumentGenerator(
    (id: string) => {
      const mockSpecGenerator = sinon.stubInterface<SpecGenerator>();
      mockSpecGenerator.getSpec.returns(mockSpec);
      mockSpecGenerator.getExtensionId.returns(id);
      return mockSpecGenerator;
    },
    {
      specs: ['spec1', 'spec2'],
      folderPath: __dirname,
      server: [],
    }
  );

  // Act
  await documentGenerator.generateDocuments([]);

  // Arrange
  expect(
    await fs.readFile(path.resolve(__dirname, 'spec-spec1.yaml'), 'utf-8')
  ).toEqual(`someSpec: ${mockSpec.someSpec}\n`);
  expect(
    await fs.readFile(path.resolve(__dirname, 'spec-spec2.yaml'), 'utf-8')
  ).toEqual(`someSpec: ${mockSpec.someSpec}\n`);
});
