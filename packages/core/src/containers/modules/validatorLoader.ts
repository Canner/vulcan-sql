import { AsyncContainerModule } from 'inversify';
import { IValidatorLoader, ValidatorLoader } from '@vulcan-sql/core/validators';
import { TYPES } from '../types';

export const validatorLoaderModule = () =>
  new AsyncContainerModule(async (bind) => {
    // Validator Loader
    bind<IValidatorLoader>(TYPES.ValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();
  });
