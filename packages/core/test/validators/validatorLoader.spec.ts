import { ValidatorLoader } from '@validators/.';
import * as path from 'path';

describe('Test validator loader ', () => {
  it.each([
    // built-in validator
    { name: 'date', expected: 'date' },
    { name: 'uuid', expected: 'uuid' },
    { name: 'integer', expected: 'integer' },
    { name: 'string', expected: 'string' },
    // custom validator
    { name: 'ip', expected: 'ip' },
  ])(
    'Should load successfully when loading validator name "$name".',
    async ({ name, expected }) => {
      // Arrange
      const folderPath = path.resolve(__dirname, 'test-custom-validators');
      const validatorLoader = new ValidatorLoader(folderPath);
      // Act
      const result = await validatorLoader.load(name);

      // Assert
      expect(result.name).toEqual(expected);
    }
  );

  it.each([{ name: 'not-existed-validator' }])(
    'Should load failed when loading validator name "$name".',
    async ({ name }) => {
      // Arrange
      const folderPath = path.resolve(__dirname, 'test-custom-validators');
      const validatorLoader = new ValidatorLoader(folderPath);
      // Act
      const loadAction = validatorLoader.load(name);

      // Asset
      await expect(loadAction).rejects.toThrow(Error);
    }
  );
});
