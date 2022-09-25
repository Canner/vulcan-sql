import {
  InputValidator,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import * as Joi from 'joi';
import { ConfigurationError, UserError } from '../../utils/errors';

export interface RequiredInputArgs {
  /**
   * Beside undefined not be required, which input also not as required value.
   * e.g: disallow: ['', {}] means, undefined,'', {} also disallow
   *  */
  disallow?: string[];
}

// required means disallow undefined as value
@VulcanInternalExtension()
@VulcanExtensionId('required')
export class RequiredValidator extends InputValidator {
  // Validator for arguments schema in schema.yaml, should match RequiredInputArgs
  private argsValidator = Joi.object({
    disallow: Joi.array().items(Joi.any()).optional(),
  });

  public validateSchema(args: RequiredInputArgs) {
    try {
      // validate arguments schema
      Joi.assert(args, this.argsValidator);
    } catch {
      throw new ConfigurationError(
        'The arguments schema for "required" type validator is incorrect'
      );
    }
  }

  public validateData(
    value?: string | boolean | number | null,
    args?: RequiredInputArgs
  ) {
    let schema = Joi.any().required();

    try {
      // if args.exclude existed, check value is
      if (args?.disallow) {
        schema = schema.invalid(...args.disallow);
      }
      Joi.assert(value, schema);
    } catch {
      throw new UserError(
        'The input parameter is invalid, it should be required'
      );
    }
  }
}
