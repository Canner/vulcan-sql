import { RawAPISchema } from '@vulcan/build/schema-parser';
import { normalizeFieldIn } from '@vulcan/build/schema-parser/middleware';
import { FieldInType } from '@vulcan/core';

it('Should normalize in field', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    request: [
      {
        fieldIn: 'qUerY' as any,
      },
    ],
  };
  // Act
  await normalizeFieldIn()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].fieldIn).toEqual(FieldInType.QUERY);
});
