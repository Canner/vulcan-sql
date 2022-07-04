import { ContainerModule } from 'inversify';
import { ValidatorLoader } from '@vulcan/core/validators';
import { TYPES } from '../types';

export const validatorModule = () =>
  new ContainerModule((bind) => {
    bind<ValidatorLoader>(TYPES.ValidatorLoader).toConstantValue({
      // TODO: Mock value
      getLoader: (name: string) => {
        return {
          name,
          validateSchema: () => true,
          validateData: () => true,
        };
      },
    });
  });
