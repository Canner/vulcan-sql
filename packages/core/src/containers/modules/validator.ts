import { AsyncContainerModule } from 'inversify';
import { IValidatorLoader, ValidatorLoader } from '@vulcan/core/validators';
import { TYPES } from '../types';

export const validatorModule = () =>
  new AsyncContainerModule(async (bind) => {
    bind<IValidatorLoader>(TYPES.IValidatorLoader).toDynamicValue(
      (context) => new ValidatorLoader()
    );
  });
