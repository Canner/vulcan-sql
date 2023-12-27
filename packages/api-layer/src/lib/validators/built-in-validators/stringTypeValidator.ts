import {
  InputValidator,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import * as Joi from 'joi';
import { isUndefined } from 'lodash';
import { ConfigurationError, UserError } from '../../utils/errors';
import { Constraint } from '../constraints';
export interface StringInputArgs {
  // The string regex format pattern
  format?: string;
  // The string length
  length?: number;
  // The string minimum value
  min?: number;
  // The string maximum value
  max?: number;
}

@VulcanInternalExtension()
@VulcanExtensionId('string')
export class StringTypeValidator extends InputValidator {
  // Validator for arguments schema in schema.yaml, should match StringInputArgs
  private argsValidator = Joi.object({
    format: Joi.string().optional(),
    length: Joi.number().optional(),
    min: Joi.number().optional(),
    max: Joi.number().optional(),
  });

  public validateSchema(args: StringInputArgs) {
    try {
      // validate arguments schema
      Joi.assert(args, this.argsValidator);
    } catch {
      throw new ConfigurationError(
        'The arguments schema for "string" type validator is incorrect'
      );
    }
  }

  public validateData(value: string, args?: StringInputArgs) {
    // schema is string type
    let schema = Joi.string();

    // if there are args passed
    if (!isUndefined(args)) {
      // support length, min, max validator if input field existed
      schema = !isUndefined(args.length) ? schema.length(args.length) : schema;
      schema = !isUndefined(args.min) ? schema.min(args.min) : schema;
      schema = !isUndefined(args.max) ? schema.max(args.max) : schema;
      // support regular expression pattern when input field existed
      schema = args.format ? schema.pattern(new RegExp(args.format)) : schema;
    }
    try {
      // validate data value
      Joi.assert(value, schema);
    } catch {
      throw new UserError(
        'The input parameter is invalid, it should be string type'
      );
    }
  }

  public override getConstraints(args: StringInputArgs) {
    const constraints: Constraint[] = [Constraint.Type('string')];
    if (!isUndefined(args.min))
      constraints.push(Constraint.MinLength(args.min));
    if (!isUndefined(args.max))
      constraints.push(Constraint.MaxLength(args.max));
    if (!isUndefined(args.length)) {
      constraints.push(Constraint.MinLength(args.length));
      constraints.push(Constraint.MaxLength(args.length));
    }
    if (args.format) constraints.push(Constraint.Regex(args.format));
    return constraints;
  }
}
