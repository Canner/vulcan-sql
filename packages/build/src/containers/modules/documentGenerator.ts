import { IDocumentGeneratorOptions } from '@vulcan-sql/build/models';
import { AsyncContainerModule } from 'inversify';
import { DocumentGenerator } from '../../lib/document-generator';
import { DocumentGeneratorOptions } from '../../options/documentGenerator';
import { TYPES } from '../types';

export const documentGeneratorModule = (options?: IDocumentGeneratorOptions) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<IDocumentGeneratorOptions>(
      TYPES.DocumentGeneratorInputOptions
    ).toConstantValue(options || ({} as any));
    bind(TYPES.DocumentGeneratorOptions)
      .to(DocumentGeneratorOptions)
      .inSingletonScope();

    // Document generator
    bind(TYPES.DocumentGenerator).to(DocumentGenerator);
    bind(TYPES.Factory_SpecGenerator).toAutoNamedFactory(
      TYPES.Extension_SpecGenerator
    );
  });
