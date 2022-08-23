import { TYPES } from '@vulcan-sql/serve/containers';
import { DocumentServer } from '@vulcan-sql/serve/models';
import { AsyncContainerModule, interfaces } from 'inversify';

export const documentServerModule = () =>
  new AsyncContainerModule(async (bind) => {
    bind<interfaces.AutoNamedFactory<DocumentServer>>(
      TYPES.Factory_DocumentServer
    ).toAutoNamedFactory(TYPES.Extension_DocumentServer);
  });
