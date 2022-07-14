import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { normalizeDataType } from '@vulcan-sql/build/schema-parser/middleware';
import { FieldDataType } from '@vulcan-sql/core';

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
  // Act
  await normalizeDataType()(schema, async () => Promise.resolve());
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
  // Act
  await normalizeDataType()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.response?.[0].type).toEqual(FieldDataType.NUMBER);
  expect((schema.response?.[1] as any).type[0].type).toEqual(
    FieldDataType.BOOLEAN
  );
});
