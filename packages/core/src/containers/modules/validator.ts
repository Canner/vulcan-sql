import { ContainerModule } from 'inversify';
import { ValidatorLoader } from '../../validators/validatorLoader';
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
