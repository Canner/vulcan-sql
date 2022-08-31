import { TYPES } from '@vulcan-sql/serve/containers';
import { DocumentRouter } from '@vulcan-sql/serve/models';
import { AsyncContainerModule, interfaces } from 'inversify';

export const documentRouterModule = () =>
  new AsyncContainerModule(async (bind) => {
    bind<interfaces.AutoNamedFactory<DocumentRouter>>(
      TYPES.Factory_DocumentRouter
    ).toAutoNamedFactory(TYPES.Extension_DocumentRouter);
  });
