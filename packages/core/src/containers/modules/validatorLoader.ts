import { AsyncContainerModule } from 'inversify';
import { IValidatorLoader, ValidatorLoader } from '@vulcan-sql/core/validators';
import { TYPES } from '../types';
import { SourceOfExtensions } from '../../models/coreOptions';

export const validatorLoaderModule = (extensions?: SourceOfExtensions) =>
  new AsyncContainerModule(async (bind) => {
    // SourceOfExtensions
    bind<SourceOfExtensions>(TYPES.SourceOfExtensions).toConstantValue(
      extensions || []
    );
    // Validator Loader
    bind<IValidatorLoader>(TYPES.ValidatorLoader)
      .to(ValidatorLoader)
      .inSingletonScope();
  });
