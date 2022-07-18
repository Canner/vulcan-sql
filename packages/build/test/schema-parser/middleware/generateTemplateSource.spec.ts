import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { GenerateTemplateSource } from '@vulcan-sql/build/schema-parser/middleware/generateTemplateSource';

it('Should keep templateSource in schema', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
  };
  const generateTemplateSource = new GenerateTemplateSource();
  // Act
  await generateTemplateSource.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema['templateSource']).toEqual('existed/path');
});

it('Should add fallback value (source name) when templateSource is empty', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some/name',
  };
  const generateTemplateSource = new GenerateTemplateSource();
  // Act
  await generateTemplateSource.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema['templateSource']).toEqual('some/name');
});
