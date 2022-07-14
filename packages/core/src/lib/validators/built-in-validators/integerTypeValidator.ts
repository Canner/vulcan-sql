import * as Joi from 'joi';
import { isUndefined } from 'lodash';
import { IValidator } from '../validator';

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

export class IntegerTypeValidator implements IValidator {
  public readonly name = 'integer';
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
      throw new Error(
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
      schema = args.min ? schema.min(args.min) : schema;
      schema = args.max ? schema.max(args.max) : schema;
      schema = args.greater ? schema.greater(args.greater) : schema;
      schema = args.less ? schema.less(args.less) : schema;
    }
    try {
      Joi.assert(value, schema);
    } catch {
      throw new Error(
        'The input parameter is invalid, it should be integer type'
      );
    }
  }
}
