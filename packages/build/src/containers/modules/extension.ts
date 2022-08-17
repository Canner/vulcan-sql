import { builtInSchemaReader } from '@vulcan-sql/build/schema-parser';
import { ExtensionLoader } from '@vulcan-sql/core';
import { AsyncContainerModule } from 'inversify';
import { builtInSpecGenerator } from '../../lib/document-generator';
import { IBuildOptions } from '../../models/buildOptions';

export const extensionModule = (options: IBuildOptions) =>
  new AsyncContainerModule(async (bind) => {
    const loader = new ExtensionLoader(options);
    // Internal extension modules

    // Schema reader
    loader.loadInternalExtensionModule(builtInSchemaReader);

    // Spec generator
    loader.loadInternalExtensionModule(builtInSpecGenerator);

    loader.bindExtensions(bind);
  });
