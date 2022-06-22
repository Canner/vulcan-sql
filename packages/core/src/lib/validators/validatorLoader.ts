import { IValidator } from './validator';
import * as glob from 'glob';
import * as path from 'path';
import { ModuleLoader, Type } from '../utils';

// The extension module interface
export interface ExtensionModule {
  validators?: Type<IValidator>[];
}

export interface IValidatorLoader {
  load(validatorName: string): Promise<IValidator>;
}

export class ValidatorLoader extends ModuleLoader implements IValidatorLoader {
  // only found built-in validators in sub folders
  private builtInFolder: string = path.join(__dirname, 'data-type-validators');
  private extensionPath?: string;

  constructor(folderPath?: string) {
    super();
    this.extensionPath = folderPath;
  }
  public async load(validatorName: string) {
    // read built-in validators in index.ts, the content is an array middleware class
    const builtInClass = await this.import<Type<IValidator>[]>(
      this.builtInFolder
    );

    // if extension path setup, load extension middlewares classes
    let extensionClass: Type<IValidator>[] = [];
    if (this.extensionPath) {
      // import extension which user customized
      const module = await this.import<ExtensionModule>(this.extensionPath);
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

  private async getValidatorFilePaths(sourcePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(sourcePath, { nodir: true }, (err, files) => {
        if (err) return reject(err);
        else return resolve(files);
      });
    });
  }
}
