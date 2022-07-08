import { IValidator } from './validator';
import * as path from 'path';
import { inject, injectable, optional } from 'inversify';
import { defaultImport, ClassType, mergedModules } from '../utils';
import { TYPES } from '../../containers/types';
import { SourceOfExtensions } from '../../models/coreOptions';
import { flatten } from 'lodash';

export interface ExtensionModule {
  validators?: ClassType<IValidator>[];
}

export interface IValidatorLoader {
  load(validatorName: string): Promise<IValidator>;
}

@injectable()
export class ValidatorLoader implements IValidatorLoader {
  // only found built-in validators in sub folders
  private builtInFolder: string = path.join(__dirname, 'built-in-validators');
  private extensions: Array<string>;

  constructor(
    @inject(TYPES.SourceOfExtensions)
    @optional()
    extensions?: SourceOfExtensions
  ) {
    this.extensions = extensions || [];
  }
  public async load(validatorName: string) {
    // read built-in validators in index.ts, the content is an array middleware class
    const builtInClasses = flatten(
      await defaultImport<ClassType<IValidator>[]>(this.builtInFolder)
    );

    // if extension path setup, load extension middlewares classes
    let extensionClasses: ClassType<IValidator>[] = [];
    if (this.extensions) {
      // import extension which user customized
      const modules = await defaultImport<ExtensionModule>(...this.extensions);
      const module = await mergedModules<ExtensionModule>(modules);
      extensionClasses = module.validators || [];
    }

    // reverse the array to make the extensions priority higher than built-in validators if has the duplicate name.
    const validatorClasses = [...builtInClasses, ...extensionClasses].reverse();
    for (const validatorClass of validatorClasses) {
      // create all middlewares by new it
      const validator = new validatorClass() as IValidator;
      if (validator.name === validatorName) return validator;
    }

    // throw error if not found
    throw new Error(
      `The name "${validatorName}" of validator not defined in built-in validators and passed folder path, or the defined validator not export as default.`
    );
  }
}
