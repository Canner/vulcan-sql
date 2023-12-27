import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { NormalizeFieldIn } from '@vulcan-sql/build/schema-parser/middleware/normalizeFieldIn';
import { FieldInType } from '@vulcan-sql/api-layer';

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
  const normalizeFieldIn = new NormalizeFieldIn();
  // Act
  await normalizeFieldIn.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].fieldIn).toEqual(FieldInType.QUERY);
});
