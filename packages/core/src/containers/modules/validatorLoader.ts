import { AsyncContainerModule } from 'inversify';
import { IValidatorLoader, ValidatorLoader } from '@vulcan/core/validators';
import { TYPES } from '../types';
import { SourceOfExtensions } from '../../models/coreOptions';

export const validatorLoaderModule = (extensions?: SourceOfExtensions) =>
  new AsyncContainerModule(async (bind) => {
    // sources extension option
    bind<SourceOfExtensions>(TYPES.SourceOfExtensions).toConstantValue(
      extensions || []
    );
    // Validator Loader
    bind<IValidatorLoader>(TYPES.IValidatorLoader).to(ValidatorLoader)
      .inSingletonScope;
  });
