import * as Joi from 'joi';
import { isUndefined } from 'lodash';
import moment from 'moment';
import IValidator from '../validator';

export interface DateInputArgs {
  // The date needed format, supported ISO_8601 token, ref: https://www.w3.org/TR/NOTE-datetime
  // e.g: "YYYYMMDD", "YYYY-MM-DD", "YYYY-MM-DD HH:mm",
  format?: string;
}

export class DateTypeValidator implements IValidator {
  public readonly name = 'date';
  // Validator for arguments schema in schema.yaml, should match DateInputArgs
  private argsValidator = Joi.object({
    format: Joi.string().optional(),
  });

  public validateSchema(args: DateInputArgs): boolean {
    try {
      // validate arguments schema
      Joi.assert(args, this.argsValidator);
      return true;
    } catch {
      throw new Error('The arguments schema for date type is incorrect');
    }
  }

  validateData(value: string, args: DateInputArgs): boolean {
    // close warning to prevent showing deprecation warning message
    moment.suppressDeprecationWarnings = true;
    let valid = moment(value).isValid();
    // if there are args passed
    if (!isUndefined(args)) {
      // validate date, support format validator if input field existed
      valid = args.format ? moment(value, args.format, true).isValid() : valid;
    }

    if (!valid)
      throw new Error('The input parameter is invalid, it should be date type');
    return true;
  }
}
