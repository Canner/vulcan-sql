import faker from '@faker-js/faker';
import { StringTypeValidator } from '@validators/data-type-validators';

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
      const validator = new StringTypeValidator();
      const result = validator.validateSchema(args);

      // Assert
      expect(result).toBe(true);
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
      const validator = new StringTypeValidator();

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
      const validator = new StringTypeValidator();
      const result = validator.validateData(data, args);

      // Assert
      expect(result).toBe(true);
    }
  );
  it.each([
    ['ABC', '{"format": "[a-z]"}'],
    ['ab123456789', '{"length": "10"}'],
    ['ABCDEFGHIJK', '{"format": "[A-Z]", "length": 10}'],
    ['abcdefghijk', '{"format": "[A-Z]", "length": 10}'],
  ])(
    'Should be invalid when validate data %p with args is %p',
    async (data: string, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new StringTypeValidator();

      // Assert
      expect(() => validator.validateData(data, args)).toThrow();
    }
  );
});
