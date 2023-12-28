import { TYPES } from '@vulcan-sql/core';
import { IValidatorLoader, ValidatorLoader } from '@vulcan-sql/core/validators';
import { Container } from 'inversify';
import * as path from 'path';
import { extensionModule } from '../../src/containers/modules';

describe('Test validator loader for built-in validators', () => {
  let container: Container;

  beforeEach(async () => {
    container = new Container();
    await container.loadAsync(extensionModule({} as any));
    container
      .bind(TYPES.ValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();
  });

  afterEach(async () => {
    await container.unbindAllAsync();
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
      const result = validatorLoader.getValidator(name);

      // Assert
      expect(result.getExtensionId()).toEqual(expected);
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
      const loadAction = () => validatorLoader.getValidator(name);

      // Asset
      expect(loadAction).toThrow(Error);
    }
  );
});

describe('Test validator loader for extension validators with one module', () => {
  let container: Container;

  beforeEach(async () => {
    container = new Container();
    await container.loadAsync(
      extensionModule({
        extensions: {
          validator1: path.resolve(
            __dirname,
            'test-custom-validators/custom-validators1'
          ),
        },
      } as any)
    );

    container
      .bind<IValidatorLoader>(TYPES.ValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();
  });

  afterEach(async () => {
    await container.unbindAllAsync();
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
      const result = validatorLoader.getValidator(name);

      // Assert
      expect(result.getExtensionId()).toEqual(expected);
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
      const loadAction = () => validatorLoader.getValidator(name);

      // Asset
      expect(loadAction).toThrow(Error);
    }
  );
});

describe('Test validator loader for extension validators in multiple module', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container
      .bind<IValidatorLoader>(TYPES.ValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();
  });

  afterEach(() => {
    container.unbind(TYPES.ValidatorLoader);
  });
  it('Should success when loading unique identifier of validators in multiple modules.', async () => {
    // Arrange
    await container.loadAsync(
      extensionModule({
        extensions: {
          validator1: [
            path.resolve(
              __dirname,
              'test-custom-validators/custom-validators1'
            ),
            path.resolve(
              __dirname,
              'test-custom-validators/custom-validators2'
            ),
          ],
        },
      } as any)
    );

    const validatorLoader = container.get<IValidatorLoader>(
      TYPES.ValidatorLoader
    );
    // Act
    const v1 = validatorLoader.getValidator('v1-1');
    const v2 = validatorLoader.getValidator('v2-1');
    // Assert
    expect(v1.getExtensionId()).toBe('v1-1');
    expect(v2.getExtensionId()).toBe('v2-1');
  });

  it('Should load failed when found duplicate identifier of validators in multiple modules.', async () => {
    // Arrange
    await container.loadAsync(
      extensionModule({
        extensions: {
          validator1: [
            path.resolve(
              __dirname,
              'test-custom-validators/custom-validators1'
            ),
            // the custom-validators3 also contains the same identifier "v1-1"
            path.resolve(
              __dirname,
              'test-custom-validators/custom-validators3'
            ),
          ],
        },
      } as any)
    );

    // Act
    const action = () => container.get<IValidatorLoader>(TYPES.ValidatorLoader);

    // Assert
    expect(action).toThrow(
      'The identifier name "v1-1" of validator has been defined in other extensions'
    );
  });
});
