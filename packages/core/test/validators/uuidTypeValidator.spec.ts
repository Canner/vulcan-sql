import * as uuid from 'uuid';
import { UUIDTypeValidator } from '@vulcan/core/validators/data-type-validators';

describe('Test "uuid" type validator ', () => {
  it.each([
    ['{}'],
    ['{"version": "uuid_v1"}'],
    ['{"version": "uuid_v4"}'],
    ['{"version": "uuid_v5"}'],
  ])(
    'Should be valid when validate args schema %p',
    async (inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new UUIDTypeValidator();

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
      const validator = new UUIDTypeValidator();

      // Assert
      expect(() => validator.validateSchema(args)).toThrow();
    }
  );

  it.each([
    [uuid.v1(), '{}'],
    [uuid.v4(), '{}'],
    [uuid.v1(), '{"version": "uuid_v1"}'],
    [uuid.v4(), '{"version": "uuid_v4"}'],
    [
      uuid.v5('canner.com', 'da327b91-b802-4f1f-9d25-91d23eecca32'),
      '{"version": "uuid_v5"}',
    ],
  ])(
    'Should be valid when validate data %p with args is %p',
    async (data: string, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new UUIDTypeValidator();

      // Assert
      expect(() => validator.validateData(data, args)).not.toThrow();
    }
  );
  it.each([
    [uuid.v4(), '{"version": "uuid_v1"}'],
    [
      uuid.v5('canner.com', 'da327b91-b802-4f1f-9d25-91d23eecca32'),
      '{"version": "uuid_v1"}',
    ],
  ])(
    'Should be invalid when validate data %p with args is %p',
    async (data: string, inputArgs: string) => {
      // Arrange
      const args = JSON.parse(inputArgs);
      // Act
      const validator = new UUIDTypeValidator();

      // Assert
      expect(() => validator.validateData(data, args)).toThrow();
    }
  );
});
