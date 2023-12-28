import faker from '@faker-js/faker';
import { Constraint, StringTypeValidator } from '@vulcan-sql/core/validators';

describe('Test "string" type validator', () => {
  it.each([
    ['{}'],
    ['{"format": "[a-z]"}'],
    ['{"length": 10}'],
    ['{"length": "10"}'],
    ['{"min": 2}'],
    ['{"max": 10}'],
    ['{"format": "[A-Z]", "length": 10}'],
    ['{"format": "[A-Z]", "min": "2"}'],
    ['{"format": "[A-Z]", "max": 10}'],
  ])(
    'Should be valid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new StringTypeValidator({}, '');

      // Assert
      expect(() => validator.validateSchema(args)).not.toThrow();
    }
  );

  it.each([
    ['[]'],
    ['{"non-key": 1}'],
    ['{"key1": 1}'],
    ['{"key2": 2}'],
    ['{"key3": "value3"}'],
  ])(
    'Should be invalid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new StringTypeValidator({}, '');

      // Assert
      expect(() => validator.validateSchema(args)).toThrow();
    }
  );

  it.each([
    [faker.datatype.string(), '{}'],
    ['abc', '{"format": "[a-z]"}'],
    ['a123456789', '{"length": 10}'],
    ['ABCDEFGHIJ', '{"format": "[A-Z]", "length": 10}'],
  ])(
    'Should be valid when validate data %p with args is %p',
    async (data: string, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new StringTypeValidator({}, '');

      // Assert
      expect(() => validator.validateData(data, args)).not.toThrow();
    }
  );
  it.each([
    ['ABC', '{"format": "[a-z]"}'],
    ['ab123456789', '{"length": "10"}'],
    ['ABCDEFGHIJK', '{"format": "[A-Z]", "length": 10}'],
    ['abcdefghijk', '{"format": "[A-Z]", "length": 10}'],
    ['A', '{"length": 0}'],
  ])(
    'Should be invalid when validate data %p with args is %p',
    async (data: string, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new StringTypeValidator({}, '');

      // Assert
      expect(() => validator.validateData(data, args)).toThrow();
    }
  );

  it('Should return TypeConstraint, MaxLengthConstraint, and MinLengthConstraint', async () => {
    // Arrange
    const validator = new StringTypeValidator({}, '');
    // Act
    const constraints = validator.getConstraints({
      min: 3,
      max: 5,
      length: 10,
      format: '.+',
    });
    // Assert
    expect(constraints.length).toBe(6);
    expect(constraints).toContainEqual(Constraint.Type('string'));
    expect(constraints).toContainEqual(Constraint.MinLength(3));
    expect(constraints).toContainEqual(Constraint.MaxLength(5));
    expect(constraints).toContainEqual(Constraint.MaxLength(10));
    expect(constraints).toContainEqual(Constraint.MinLength(10));
    expect(constraints).toContainEqual(Constraint.Regex('.+'));
  });
});
