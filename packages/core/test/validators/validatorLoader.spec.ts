import { SourceOfExtensions, TYPES } from '@vulcan/core';
import { IValidatorLoader, ValidatorLoader } from '@vulcan/core/validators';
import { Container } from 'inversify';
import * as path from 'path';
import faker from '@faker-js/faker';

describe('Test validator loader for built-in validators', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container
      .bind<Partial<SourceOfExtensions>>(TYPES.SourceOfExtensions)
      .toConstantValue([]);
    container
      .bind(TYPES.IValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();
  });

  afterEach(() => {
    container.unbindAll();
  });
  it.each([
    // built-in validator
    { name: 'date', expected: 'date' },
    { name: 'uuid', expected: 'uuid' },
    { name: 'integer', expected: 'integer' },
    { name: 'string', expected: 'string' },
  ])(
    'Should load successfully when loading validator name "$name".',
    async ({ name, expected }) => {
      // Arrange
      const validatorLoader = container.get<IValidatorLoader>(
        TYPES.IValidatorLoader
      );
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
      const validatorLoader = container.get<IValidatorLoader>(
        TYPES.IValidatorLoader
      );
      // Act
      const loadAction = validatorLoader.load(name);

      // Asset
      await expect(loadAction).rejects.toThrow(Error);
    }
  );
});

describe('Test validator loader for extension validators in one module', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container
      .bind<Partial<SourceOfExtensions>>(TYPES.SourceOfExtensions)
      .toConstantValue([
        path.resolve(__dirname, 'test-custom-validators/custom-validators1'),
      ]);
    container
      .bind(TYPES.IValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();
  });

  afterEach(() => {
    container.unbindAll();
  });
  it.each([
    // custom validator
    { name: 'ip', expected: 'ip' },
  ])(
    'Should load successfully when loading validator name "$name".',
    async ({ name, expected }) => {
      // Arrange
      const validatorLoader = container.get<IValidatorLoader>(
        TYPES.IValidatorLoader
      );
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
      const validatorLoader = container.get<IValidatorLoader>(
        TYPES.IValidatorLoader
      );
      // Act
      const loadAction = validatorLoader.load(name);

      // Asset
      await expect(loadAction).rejects.toThrow(Error);
    }
  );
});

describe('Test validator loader for extension validators in multiple module', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container
      .bind<Partial<SourceOfExtensions>>(TYPES.SourceOfExtensions)
      .toConstantValue([
        path.resolve(__dirname, 'test-custom-validators/custom-validators1'),
        path.resolve(__dirname, 'test-custom-validators/custom-validators2'),
      ]);
    container
      .bind(TYPES.IValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();
  });

  afterEach(() => {
    container.unbindAll();
  });
  it('Should load failed when found existed validators key in multiple modules.', async () => {
    // Arrange
    const validatorLoader = container.get<IValidatorLoader>(
      TYPES.IValidatorLoader
    );
    // Act
    const loadAction = validatorLoader.load(faker.random.word().toLowerCase());

    // Assert
    expect(loadAction).rejects.toThrow(
      Error('The extension validators has defined in previous module.')
    );
  });
});
