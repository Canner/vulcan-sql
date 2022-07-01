import { RawAPISchema } from '@vulcan/build/schema-parser';
import { generateDataType } from '@vulcan/build/schema-parser/middleware';
import { FieldDataType } from '@vulcan/core';

it('Should generate data type (string) for requests when it was not defined', async () => {
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

it('Should generate data type (string) for responses when it was not defined', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    request: [],
    response: [{}, { type: [{}] as any }],
  };
  // Act
  await generateDataType()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.response?.[0].type).toEqual(FieldDataType.STRING);
  expect((schema.response?.[1].type?.[0] as any).type).toEqual(
    FieldDataType.STRING
  );
});
