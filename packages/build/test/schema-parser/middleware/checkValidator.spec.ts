import { RawAPISchema, ValidatorLoader } from '@schema-parser/.';
import { checkValidator } from '@schema-parser/middleware/checkValidator';
import * as sinon from 'ts-sinon';

it('Should pass if there is no error', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        validators: [{ name: 'validator1' }],
      },
    ],
  };
  const stubValidatorLoader = sinon.stubInterface<ValidatorLoader>();
  stubValidatorLoader.getLoader.returns({
    name: 'validator1',
    validateSchema: () => true,
    validateData: () => true,
  });

  // Act Assert
  await expect(
    checkValidator(stubValidatorLoader)(schema, async () => Promise.resolve())
  ).resolves.not.toThrow();
});

it('Should throw if some validators have no name', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        validators: [{ name: 'validator1' }, {}],
      },
    ],
  };
  const stubValidatorLoader = sinon.stubInterface<ValidatorLoader>();
  stubValidatorLoader.getLoader.returns({
    name: 'validator1',
    validateSchema: () => true,
    validateData: () => true,
  });

  // Act Assert
  await expect(
    checkValidator(stubValidatorLoader)(schema, async () => Promise.resolve())
  ).rejects.toThrow('Validator name is required');
});

it('Should throw if the arguments of a validator is invalid', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        validators: [{ name: 'validator1' }],
      },
    ],
  };
  const stubValidatorLoader = sinon.stubInterface<ValidatorLoader>();
  stubValidatorLoader.getLoader.returns({
    name: 'validator1',
    validateSchema: () => false,
    validateData: () => true,
  });

  // Act Assert
  await expect(
    checkValidator(stubValidatorLoader)(schema, async () => Promise.resolve())
  ).rejects.toThrow('Validator validator1 schema invalid');
});
