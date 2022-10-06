import {
  InputValidator,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import * as Joi from 'joi';
import { ConfigurationError } from '../../utils/errors';
import { Constraint } from '../constraints';

export interface EnumInputArgs {
  items: any[];
}

@VulcanInternalExtension()
@VulcanExtensionId('enum')
export class EnumValidator extends InputValidator {
  private argsValidator = Joi.object({
    items: Joi.array().min(1).required(),
  });

  public validateSchema(args: EnumInputArgs) {
    try {
      // validate arguments schema
      Joi.assert(args, this.argsValidator);
    } catch (e: any) {
      if (e instanceof Joi.ValidationError)
        throw new ConfigurationError(
          `The arguments schema for "enum" type validator is invalid: ${e.message}`,
          { nestedError: e }
        );
      else
        throw new ConfigurationError(
          'The arguments schema for "enum" type validator is invalid',
          { nestedError: e }
        );
    }
  }

  public validateData(value: any, args: EnumInputArgs) {
    // Only allow the values in items property
    const schema = Joi.valid(...args.items);

    try {
      Joi.assert(value, schema);
    } catch (e: any) {
      if (e instanceof Joi.ValidationError)
        throw new ConfigurationError(
          `The input data for "enum" type validator is invalid: ${e.message}`,
          { nestedError: e }
        );
      else
        throw new ConfigurationError(
          'The input data for "enum" type validator is invalid',
          { nestedError: e }
        );
    }
  }

  public override getConstraints(args: EnumInputArgs) {
    const constraints: Constraint[] = [Constraint.Enum(args.items)];
    return constraints;
  }
}
