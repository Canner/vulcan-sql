import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { normalizeFieldIn } from '@vulcan-sql/build/schema-parser/middleware';
import { FieldInType } from '@vulcan-sql/core';

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
