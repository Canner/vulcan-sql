import { AsyncContainerModule, interfaces } from 'inversify';
import { Packager } from '../../models/extensions';
import { TYPES } from '../types';

export const packagerModule = () =>
  new AsyncContainerModule(async (bind) => {
    // Document generator
    bind<interfaces.AutoNamedFactory<Packager>>(
      TYPES.Factory_Packager
    ).toAutoNamedFactory(TYPES.Extension_Packager);
  });
