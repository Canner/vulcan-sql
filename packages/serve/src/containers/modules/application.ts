import { VulcanApplication } from '@vulcan-sql/serve';
import { AsyncContainerModule } from 'inversify';
import { TYPES } from '../types';

export const applicationModule = () =>
  new AsyncContainerModule(async (bind) => {
    bind(TYPES.VulcanApplication).to(VulcanApplication);
  });
