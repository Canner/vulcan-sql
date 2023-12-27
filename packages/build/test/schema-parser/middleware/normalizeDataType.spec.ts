import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { NormalizeDataType } from '@vulcan-sql/build/schema-parser/middleware/normalizeDataType';
import { FieldDataType } from '@vulcan-sql/api-layer';

it('Should normalize data type for requests', async () => {
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
  const normalizeDataType = new NormalizeDataType();
  // Act
  await normalizeDataType.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].type).toEqual(FieldDataType.NUMBER);
});

it('Should normalize data type for responses', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    response: [
      {
        type: 'nUmBeR' as any,
      },
      {
        type: [
          {
            type: 'bOoLeAn',
          },
        ],
      },
    ],
  };
  const normalizeDataType = new NormalizeDataType();
  // Act
  await normalizeDataType.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.response?.[0].type).toEqual(FieldDataType.NUMBER);
  expect((schema.response?.[1] as any).type[0].type).toEqual(
    FieldDataType.BOOLEAN
  );
});
