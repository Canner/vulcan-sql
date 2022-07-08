import { AsyncContainerModule } from 'inversify';
import { IValidatorLoader, ValidatorLoader } from '@vulcan/core/validators';
import { TYPES } from '../types';
import { SourceOfExtensions } from '../../models/coreOptions';

export const validatorLoaderModule = (extensions?: SourceOfExtensions) =>
  new AsyncContainerModule(async (bind) => {
    // Validator Loader
    bind<IValidatorLoader>(TYPES.IValidatorLoader).to(ValidatorLoader)
      .inSingletonScope;
  });
