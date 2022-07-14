import { RequiredValidator } from '@vulcan/core/validators';

describe('Test "required" type validator', () => {
  it.each([
    ['{}'],
    ['{"disallow": []}'],
    ['{"disallow": [""]}'],
    ['{"disallow": [{}]}'],
    ['{"disallow": [0]}'],
    ['{"disallow": [false]}'],
    ['{"disallow": [0, {}, ""]}'],
  ])(
    'Should be valid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new RequiredValidator();

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
      const validator = new RequiredValidator();

      // Assert
      expect(() => validator.validateSchema(args)).toThrow();
    }
  );

  it.each([
    ['', '{}'],
    [null, '{}'],
    ['0', '{"disallow": []}'],
    ['false', '{"disallow": []}'],
    [false, '{"disallow": [true]}'],
    [' ', '{"disallow": []}'],
    ['none', '{"disallow": ["null"]}'],
  ])(
    'Should be valid when validate data %p with args is %p',
    async (data: string | boolean | number | null, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new RequiredValidator();

      // Assert
      expect(() => validator.validateData(data, args)).not.toThrow();
    }
  );
  it.each([
    [undefined, '{}'],
    [null, '{"disallow": [null]}'],
    [0, '{"disallow": [0]}'],
    ['0', '{"disallow": ["0"]}'],
    ['', '{"disallow": [""]}'],
    [' ', '{"disallow": [" "]}'],
    [false, '{"disallow": [false]}'],
    ['{}', '{"disallow": ["{}"]}'],
  ])(
    'Should be invalid when validate data %p with args is %p',
    async (
      data: string | boolean | number | null | undefined,
      inputArgs: string
    ) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new RequiredValidator();

      // Assert
      expect(() => validator.validateData(data, args)).toThrow();
    }
  );
});
