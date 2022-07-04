import { IValidator } from './validator';
import * as path from 'path';
import { injectable } from 'inversify';
import { defaultImport, ClassType } from '../utils';

// The extension module interface
export interface ExtensionModule {
  validators?: ClassType<IValidator>[];
}

export interface IValidatorLoader {
  load(validatorName: string): Promise<IValidator>;
}

@injectable()
export class ValidatorLoader implements IValidatorLoader {
  // only found built-in validators in sub folders
  private builtInFolder: string = path.join(__dirname, 'data-type-validators');
  private extensionPath?: string;

  constructor(folderPath?: string) {
    this.extensionPath = folderPath;
  }
  public async load(validatorName: string) {
    // read built-in validators in index.ts, the content is an array middleware class
    const builtInClass = await defaultImport<ClassType<IValidator>[]>(
      this.builtInFolder
    );

    // if extension path setup, load extension middlewares classes
    let extensionClass: ClassType<IValidator>[] = [];
    if (this.extensionPath) {
      // import extension which user customized
      const module = await defaultImport<ExtensionModule>(this.extensionPath);
      extensionClass = module.validators || [];
    }

    // create all middlewares by new it.
    for (const validatorClass of [...builtInClass, ...extensionClass]) {
      const validator = new validatorClass() as IValidator;
      if (validator.name === validatorName) return validator;
    }

    // throw error if not found
    throw new Error(
      `The name "${validatorName}" of validator not defined in built-in validators and passed folder path, or the defined validator not export as default.`
    );
  }
}
