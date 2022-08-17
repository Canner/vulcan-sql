import {
  IDocumentGeneratorOptions,
  SpecGenerator,
} from '@vulcan-sql/build/models';
import { AsyncContainerModule, interfaces } from 'inversify';
import { DocumentGenerator } from '../../lib/document-generator';
import { DocumentGeneratorOptions } from '../../options/documentGenerator';
import { TYPES } from '../types';

export const documentGeneratorModule = (options?: IDocumentGeneratorOptions) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<IDocumentGeneratorOptions>(
      TYPES.DocumentGeneratorInputOptions
    ).toConstantValue(options || ({} as any));
    bind<IDocumentGeneratorOptions>(TYPES.DocumentGeneratorOptions)
      .to(DocumentGeneratorOptions)
      .inSingletonScope();

    // Document generator
    bind<DocumentGenerator>(TYPES.DocumentGenerator).to(DocumentGenerator);
    bind<interfaces.AutoNamedFactory<SpecGenerator>>(
      TYPES.Factory_SpecGenerator
    ).toAutoNamedFactory(TYPES.Extension_SpecGenerator);
  });
