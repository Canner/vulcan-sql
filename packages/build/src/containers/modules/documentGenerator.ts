import { SpecGenerator } from '@vulcan-sql/build/models';
import { AsyncContainerModule, interfaces } from 'inversify';
import { DocumentGenerator } from '../../lib/document-generator';
import { TYPES } from '../types';

export const documentGeneratorModule = () =>
  new AsyncContainerModule(async (bind) => {
    // Document generator
    bind<DocumentGenerator>(TYPES.DocumentGenerator).to(DocumentGenerator);
    bind<interfaces.AutoNamedFactory<SpecGenerator>>(
      TYPES.Factory_SpecGenerator
    ).toAutoNamedFactory(TYPES.Extension_SpecGenerator);
  });
