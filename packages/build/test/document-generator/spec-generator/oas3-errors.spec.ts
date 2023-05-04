import { OAS3SpecGenerator } from '@vulcan-sql/build/doc-generator';

it('Should throw error with invalid fieldIn', async () => {
  // Arrange
  const generator = new OAS3SpecGenerator({}, '', {});
  // Act, Assert
  expect(() =>
    generator.getSpec([
      {
        urlPath: '/user',
        request: [
          {
            name: 'id',
            fieldIn: 'INVALID_VALUE',
          },
        ],
      } as any,
    ])
  ).toThrow(`FieldInType INVALID_VALUE is not supported`);
});

it('Should throw error with invalid FieldType', async () => {
  // Arrange
  const generator = new OAS3SpecGenerator({}, '', {});
  // Act, Assert
  expect(() =>
    generator.getSpec([
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
    ])
  ).toThrow(`FieldDataType INVALID_VALUE is not supported`);
});
