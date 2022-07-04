import IValidator from './validator';
import * as glob from 'glob';
import * as path from 'path';
import { injectable } from 'inversify';

export interface IValidatorLoader {
  load(validatorName: string): Promise<IValidator>;
}

@injectable()
export class ValidatorLoader implements IValidatorLoader {
  // only found built-in validators in sub folders
  private builtInFolderPath: string = path.resolve(__dirname, '*', '*.ts');
  private userDefinedFolderPath?: string;

  constructor(folderPath?: string) {
    this.userDefinedFolderPath = folderPath;
  }
  public async load(validatorName: string) {
    let validatorFiles = [
      ...(await this.getValidatorFilePaths(this.builtInFolderPath)),
    ];
    if (this.userDefinedFolderPath) {
      // include sub-folder or non sub-folders
      const userDefinedValidatorFiles = await this.getValidatorFilePaths(
        path.resolve(this.userDefinedFolderPath, '**', '*.ts')
      );
      validatorFiles = validatorFiles.concat(userDefinedValidatorFiles);
    }

    for (const file of validatorFiles) {
      // import validator files to module
      const validatorModule = await import(file);
      // get validator class by getting default.
      if (validatorModule && validatorModule.default) {
        const validatorClass = validatorModule.default;
        const validator = new validatorClass() as IValidator;
        if (validator.name === validatorName) return validator;
      }
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
