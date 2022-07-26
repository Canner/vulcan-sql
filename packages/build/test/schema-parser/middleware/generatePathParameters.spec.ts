import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { GeneratePathParameters } from '@vulcan-sql/build/schema-parser/middleware/generatePathParameters';
import { FieldDataType, FieldInType } from '@vulcan-sql/core';

it('Should generate path parameters when they were not defined', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-source',
    urlPath: 'existed/path/:id/order/:oid',
    request: [],
  };
  const generatePathParameters = new GeneratePathParameters();
  // Act
  await generatePathParameters.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].fieldName).toEqual('id');
  expect(schema.request?.[0].type).toEqual(FieldDataType.STRING);
  expect(schema.request?.[0].fieldIn).toEqual(FieldInType.PATH);

  expect(schema.request?.[1].fieldName).toEqual('oid');
  expect(schema.request?.[1].type).toEqual(FieldDataType.STRING);
  expect(schema.request?.[1].fieldIn).toEqual(FieldInType.PATH);
});

it('Should keep original parameters when they had been defined', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-source',
    urlPath: 'existed/path/:id',
    request: [
      {
        fieldName: 'id',
        fieldIn: FieldInType.PATH,
        type: FieldDataType.NUMBER,
      },
    ],
  };
  const generatePathParameters = new GeneratePathParameters();
  // Act
  await generatePathParameters.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].fieldName).toEqual('id');
  expect(schema.request?.[0].type).toEqual(FieldDataType.NUMBER);
});
