import {
  CodeLoader,
  ExtensionBase,
  FilterRunner,
  RuntimeExtension,
  TagRunner,
  TemplateEngineExtension,
} from '@vulcan-sql/core/models';
import { TYPES } from '@vulcan-sql/core/types';
import { IValidatorLoader } from '@vulcan-sql/core/validators';
import { inject, multiInject, optional } from 'inversify';
import { omit } from 'lodash';
import { InternalError } from '../../utils/errors';
import { getValidationFilterName } from '../extension-utils';
import { BaseCompilerEnvironment } from './base';

/**
 * Runtime environment is used when we executing templates.
 */
export class RuntimeCompilerEnvironment extends BaseCompilerEnvironment {
  private extensions: RuntimeExtension[] = [];
  private validatorLoader: IValidatorLoader;

  constructor(
    @inject(TYPES.CompilerLoader)
    compilerLoader: CodeLoader,
    @multiInject(TYPES.Extension_TemplateEngine)
    @optional()
    extensions: TemplateEngineExtension[] = [],
    @inject(TYPES.ValidatorLoader) validatorLoader: IValidatorLoader
  ) {
    super(compilerLoader);
    // We only need runtime extensions like filterRunner, tagRunner ...etc.
    this.extensions = extensions.filter(
      (extension) => extension instanceof RuntimeExtension
    );
    this.validatorLoader = validatorLoader;
    this.loadExtensions();
  }

  public getExtensions(): ExtensionBase<any>[] {
    return this.extensions;
  }

  private loadExtensions(): void {
    this.extensions.forEach(this.loadExtension.bind(this));
    // Validator filters
    for (const validator of this.validatorLoader.getValidators()) {
      this.addFilter(
        getValidationFilterName(validator),
        (value: any, rawArgs: any) => {
          const args = omit(rawArgs, '__keywords'); // Remove the additional property from template engine.
          try {
            validator.validateSchema(args);
          } catch (e: any) {
            throw new InternalError(
              `Validation filter ${validator.getExtensionId()} has invalid argument`,
              { nestedError: e }
            );
          }

          validator.validateData(value, args);

          return value;
        },
        false
      );
    }
  }

  private loadExtension(extension: RuntimeExtension) {
    if (extension instanceof TagRunner) {
      this.addExtension(extension.getName(), extension);
    } else if (extension instanceof FilterRunner) {
      this.addFilter(
        extension.filterName,
        function (this: any, value: any, ...args) {
          // use classic function to receive context
          extension.__transform(this, value, ...args);
        },
        true
      );
    }
  }
}
