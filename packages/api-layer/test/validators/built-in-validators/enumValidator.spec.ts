import { Constraint, EnumValidator } from '@vulcan-sql/api-layer/validators';

describe('Test "enum" validator', () => {
  it.each([
    ['{ "items": [1] }'],
    ['{ "items": [1,2,3] }'],
    [`{ "items": ["1","2","3"] }`],
    [`{ "items": ["1", 2, false] }`],
  ])(
    'Should be valid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new EnumValidator({}, '');

      // Assert
      expect(() => validator.validateSchema(args)).not.toThrow();
    }
  );

  it.each([
    ['[]'],
    ['{}'],
    ['{"key1": 1, "items": []}'],
    ['{"key2": 2}'],
    ['{"items": 2}'],
    ['{"items": []}'],
  ])(
    'Should be invalid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new EnumValidator({}, '');

      // Assert
      expect(() => validator.validateSchema(args)).toThrow();
    }
  );

  it.each([
    ['1', '{"items": ["1"]}'],
    [1, '{"items": [1]}'],
    ['1', '{"items": [1]}'],
    ['true', '{"items": [true]}'],
    [true, '{"items": [true]}'],
    [true, '{"items": ["true"]}'],
    [1, '{"items": [2,3,1,1]}'],
    [undefined, '{"items": [2]}'],
  ])(
    'Should be valid when validate data %p with args is %p',
    async (data: any, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new EnumValidator({}, '');

      // Assert
      expect(() => validator.validateData(data, args)).not.toThrow();
    }
  );

  it.each([
    [1, '{"items": [2,3,4]}'],
    [false, '{"items": ["true"]}'],
  ])(
    'Should be invalid when validate data %p with args is %p',
    async (data: any, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new EnumValidator({}, '');

      // Assert
      expect(() => validator.validateData(data, args)).toThrow();
    }
  );

  it('Should return EnumConstraint', async () => {
    // Arrange
    const validator = new EnumValidator({}, '');
    // Act
    const constraints = validator.getConstraints({ items: [1, 2, 3] });
    // Assert
    expect(constraints.length).toBe(1);
    expect(constraints).toContainEqual(Constraint.Enum([1, 2, 3]));
  });
});
