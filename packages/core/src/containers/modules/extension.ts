import { AsyncContainerModule } from 'inversify';
import { ExtensionLoader } from '../../lib/extension-loader';
import { ICoreOptions } from '../../models/coreOptions';
import templateEngineModules from '../../lib/template-engine/built-in-extensions';
import validatorModule from '../../lib/validators/built-in-validators';

export const extensionModule = (options: ICoreOptions) =>
  new AsyncContainerModule(async (bind) => {
    const loader = new ExtensionLoader(options);
    // Internal extension modules

    // Template engine (multiple modules)
    for (const templateEngineModule of templateEngineModules) {
      loader.loadInternalExtensionModule(templateEngineModule);
    }
    // Validator (single module)
    loader.loadInternalExtensionModule(validatorModule);

    // External extension modules
    await loader.loadExternalExtensionModules();

    loader.bindExtensions(bind);
  });
