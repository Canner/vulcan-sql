import {
  InputValidator,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import * as Joi from 'joi';
import { isUndefined } from 'lodash';
import { ConfigurationError, UserError } from '../../utils/errors';
import { Constraint } from '../constraints';

export interface IntInputArgs {
  // The integer minimum value
  min?: number;
  // The integer maximum value
  max?: number;
  // The integer should greater than value
  greater?: number;
  // The integer should less than value
  less?: number;
}

@VulcanInternalExtension()
@VulcanExtensionId('integer')
export class IntegerTypeValidator extends InputValidator {
  // Validator for arguments schema in schema.yaml, should match IntInputArgs
  private argsValidator = Joi.object({
    min: Joi.number().integer().optional(),
    max: Joi.number().integer().optional(),
    greater: Joi.number().integer().optional(),
    less: Joi.number().integer().optional(),
  });

  public validateSchema(args: IntInputArgs) {
    try {
      // validate arguments schema
      Joi.assert(args, this.argsValidator);
    } catch {
      throw new ConfigurationError(
        'The arguments schema for "integer" type validator is incorrect'
      );
    }
  }

  public validateData(value: string | number, args?: IntInputArgs) {
    // parse arguments

    // schema is integer type
    let schema = Joi.number().integer();

    // if there are args passed
    if (!isUndefined(args)) {
      // support min, max, greater, less validator if input field existed
      schema = !isUndefined(args.min) ? schema.min(args.min) : schema;
      schema = !isUndefined(args.max) ? schema.max(args.max) : schema;
      schema = !isUndefined(args.greater)
        ? schema.greater(args.greater)
        : schema;
      schema = !isUndefined(args.less) ? schema.less(args.less) : schema;
    }
    try {
      Joi.assert(value, schema);
    } catch {
      throw new UserError(
        'The input parameter is invalid, it should be integer type'
      );
    }
  }

  public override getConstraints(args: IntInputArgs) {
    const constraints: Constraint[] = [Constraint.Type('integer')];
    if (!isUndefined(args.min))
      constraints.push(Constraint.MinValue(args.min, false));
    if (!isUndefined(args.max))
      constraints.push(Constraint.MaxValue(args.max, false));
    if (!isUndefined(args.greater))
      constraints.push(Constraint.MinValue(args.greater, true));
    if (!isUndefined(args.less))
      constraints.push(Constraint.MaxValue(args.less, true));
    return constraints;
  }
}
