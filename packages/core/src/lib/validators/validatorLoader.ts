import { injectable, multiInject, optional } from 'inversify';
import { TYPES } from '../../containers/types';
import { InputValidator } from '@vulcan-sql/core/models';
import { ConfigurationError } from '../utils';

export interface IValidatorLoader {
  getValidator(validatorName: string): InputValidator;
}

@injectable()
export class ValidatorLoader implements IValidatorLoader {
  private extensions = new Map<string, InputValidator>();

  constructor(
    @multiInject(TYPES.Extension_InputValidator)
    @optional()
    extensions: InputValidator[] = []
  ) {
    this.loadValidators(extensions);
  }

  public getValidator(validatorName: string) {
    if (!this.extensions.has(validatorName))
      // throw error if not found
      throw new ConfigurationError(
        `The identifier name "${validatorName}" of validator is not defined in built-in validators or extensions configuration`
      );

    return this.extensions.get(validatorName)!;
  }

  private loadValidators(validators: InputValidator[]) {
    for (const validator of validators) {
      const validatorName = validator.getExtensionId()!;
      if (this.extensions.has(validatorName)) {
        throw new ConfigurationError(
          `The identifier name "${validatorName}" of validator has been defined in other extensions`
        );
      }
      this.extensions.set(validatorName, validator);
    }
  }
}
