import * as Joi from 'joi';
import { isUndefined } from 'lodash';
import * as dayjs from 'dayjs';
import customParseFormat = require('dayjs/plugin/customParseFormat');
import { IValidator } from '../validator';

// Support custom date format -> dayjs.format(...)
dayjs.extend(customParseFormat);

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

  public validateSchema(args: DateInputArgs) {
    try {
      // validate arguments schema
      Joi.assert(args, this.argsValidator);
    } catch {
      throw new Error(
        'The arguments schema for "date" type validator is incorrect'
      );
    }
  }

  public validateData(value: string, args?: DateInputArgs) {
    let valid = dayjs(value).isValid();
    // if there are args passed
    if (!isUndefined(args)) {
      // validate date, support format validator if input field existed
      valid = args.format ? dayjs(value, args.format, true).isValid() : valid;
    }
    if (!valid)
      throw new Error('The input parameter is invalid, it should be date type');
  }
}
