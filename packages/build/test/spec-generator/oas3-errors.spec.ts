import { OAS3SpecGenerator } from '@vulcan-sql/build/spec-generator';

it('Should throw error with invalid fieldIn', async () => {
  // Arrange
  const generator = new OAS3SpecGenerator(
    [
      {
        urlPath: '/user',
        request: [
          {
            name: 'id',
            fieldIn: 'INVALID_VALUE',
          },
        ],
      } as any,
    ],
    {} as any
  );
  // Act, Arrange
  expect(() => generator.getSpec()).toThrow(
    `FieldInType INVALID_VALUE is not supported`
  );
});

it('Should throw error with invalid FieldType', async () => {
  // Arrange
  const generator = new OAS3SpecGenerator(
    [
      {
        urlPath: '/user',
        request: [
          {
            name: 'id',
            fieldIn: 'HEADER',
            type: 'INVALID_VALUE',
          },
        ],
      } as any,
    ],
    {} as any
  );
  // Act, Arrange
  expect(() => generator.getSpec()).toThrow(
    `FieldDataType INVALID_VALUE is not supported`
  );
});
