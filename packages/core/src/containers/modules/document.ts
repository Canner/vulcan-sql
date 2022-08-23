import { AsyncContainerModule } from 'inversify';
import { TYPES } from '../types';
import { IDocumentOptions } from '../../models';
import { DocumentOptions } from '../../options';

export const documentModule = (options: IDocumentOptions = {}) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<IDocumentOptions>(TYPES.DocumentInputOptions).toConstantValue(options);
    bind<IDocumentOptions>(TYPES.DocumentOptions).to(DocumentOptions);
  });
