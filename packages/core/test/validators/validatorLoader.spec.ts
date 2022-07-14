import { SourceOfExtensions, TYPES } from '@vulcan-sql/core';
import { IValidatorLoader, ValidatorLoader } from '@vulcan-sql/core/validators';
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
      .bind(TYPES.ValidatorLoader)
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
        TYPES.ValidatorLoader
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
        TYPES.ValidatorLoader
      );
      // Act
      const loadAction = validatorLoader.load(name);

      // Asset
      await expect(loadAction).rejects.toThrow(Error);
    }
  );
});

describe('Test validator loader for extension validators with one module', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container
      .bind<Partial<SourceOfExtensions>>(TYPES.SourceOfExtensions)
      .toConstantValue([
        path.resolve(__dirname, 'test-custom-validators/custom-validators1'),
      ]);
    container
      .bind<IValidatorLoader>(TYPES.ValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();
  });

  afterEach(() => {
    container.unbindAll();
  });
  it.each([
    // custom validator
    { name: 'v1-1', expected: 'v1-1' },
    { name: 'v1-2', expected: 'v1-2' },
  ])(
    'Should load successfully when loading validator name "$name".',
    async ({ name, expected }) => {
      // Arrange
      const validatorLoader = container.get<IValidatorLoader>(
        TYPES.ValidatorLoader
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
        TYPES.ValidatorLoader
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
  });

  afterEach(() => {
    container.unbindAll();
  });
  it('Should success when loading unique identifier of validators in multiple modules.', async () => {
    // Arrange
    container
      .bind<Partial<SourceOfExtensions>>(TYPES.SourceOfExtensions)
      .toConstantValue([
        path.resolve(__dirname, 'test-custom-validators/custom-validators1'),
        path.resolve(__dirname, 'test-custom-validators/custom-validators2'),
      ]);
    container
      .bind<IValidatorLoader>(TYPES.ValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();

    const validatorLoader = container.get<IValidatorLoader>(
      TYPES.ValidatorLoader
    );
    // Act
    const v1 = await validatorLoader.load('v1-1');
    const v2 = await validatorLoader.load('v2-1');
    // Assert
    expect(v1.name).toBe('v1-1');
    expect(v2.name).toBe('v2-1');
  });

  it('Should load failed when found duplicate identifier of validators in multiple modules.', async () => {
    // Arrange
    container
      .bind<Partial<SourceOfExtensions>>(TYPES.SourceOfExtensions)
      .toConstantValue([
        path.resolve(__dirname, 'test-custom-validators/custom-validators1'),
        // the custom-validators3 also contains same identifier v1-1
        path.resolve(__dirname, 'test-custom-validators/custom-validators3'),
      ]);
    container
      .bind<IValidatorLoader>(TYPES.ValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();

    const validatorLoader = container.get<IValidatorLoader>(
      TYPES.ValidatorLoader
    );
    // Act
    const action = validatorLoader.load(faker.random.word());
    // Assert
    expect(action).rejects.toThrow(
      'The identifier name "v1-1" of validator class Validator has been defined in other extensions'
    );
  });
});
