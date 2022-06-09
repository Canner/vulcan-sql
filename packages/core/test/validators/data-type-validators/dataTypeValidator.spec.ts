import { DateTypeValidator } from '@validators/.';

describe('Test "date" type validator', () => {
  it.each([
    ['{}'],
    ['{"format": "123"}'],
    ['{"format": "DD/MM/YYYY"}'],
    ['{"format": "YYYY-MM-DD"}'],
  ])(
    'Should be valid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new DateTypeValidator();
      const result = validator.validateSchema(args);
      // Assert
      expect(() => validator.validateSchema(args)).not.toThrow();
    }
  );

  it.each([
    ['[]'],
    ['{"non-key": "non-value"}'],
    ['{"key1": "value1"}'],
    ['{"key2": "value2"}'],
  ])(
    'Should be invalid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new DateTypeValidator();

      // Assert
      expect(() => validator.validateSchema(args)).toThrow();
    }
  );

  it.each([
    ['2022', '{"format": "YYYY"}'],
    ['202210', '{"format": "YYYYMM"}'],
    ['10/10/2021', '{"format": "DD/MM/YYYY"}'],
    ['2021-10-10', '{"format": "YYYY-MM-DD"}'],
    ['2021 10 10', '{"format": "YYYY MM DD"}'],
    ['24 12 2019 09:15:00', '{"format": "DD MM YYYY hh:mm:ss"}'],
  ])(
    'Should be valid when validate data %p with args is %p',
    async (data: string, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);

      // Act
      const validator = new DateTypeValidator();

      // Assert
      expect(() => validator.validateData(data, args)).not.toThrow();
    }
  );

  it.each([
    ['2021-10-10', '{"format": "DD/MM/YYYY"}'],
    ['2021/10/10', '{"format": "YYYY-MM-DD"}'],
    ['2021/10', '{"format": "YYYY-MM-DD"}'],
  ])(
    'Should be invalid when validate data %p with args is %p',
    async (data: string, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);

      // Act
      const validator = new DateTypeValidator();

      // Assert
      expect(() => validator.validateData(data, args)).toThrow();
    }
  );
});
