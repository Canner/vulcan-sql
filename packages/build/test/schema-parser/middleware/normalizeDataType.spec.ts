import { RawAPISchema } from '@vulcan/build/schema-parser/.';
import { normalizeDataType } from '@vulcan/build/schema-parser/middleware';
import { FieldDataType } from '@vulcan/core';

it('Should normalize data type', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    request: [
      {
        type: 'nUmBeR' as any,
      },
    ],
  };
  // Act
  await normalizeDataType()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].type).toEqual(FieldDataType.NUMBER);
});
