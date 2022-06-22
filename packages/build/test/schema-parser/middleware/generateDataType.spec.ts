import { RawAPISchema } from '@vulcan/build/schema-parser/.';
import { generateDataType } from '@vulcan/build/schema-parser/middleware';
import { FieldDataType } from '@vulcan/core';

it('Should generate data type (string) when it was not defined', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    request: [{}],
  };
  // Act
  await generateDataType()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].type).toEqual(FieldDataType.STRING);
});
