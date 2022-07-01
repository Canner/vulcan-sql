import { IValidator } from '@validators/.';
import * as Joi from 'joi';
import { isUndefined } from 'lodash';

type IPVersion = 'ipv4' | 'ipv6';

export interface IPInputArgs {
  version?: IPVersion[];
}

/* istanbul ignore file */
export class IPTypeValidator implements IValidator {
  public readonly name = 'ip';
  // Validator for arguments schema in schema.yaml, should match DateInputArgs
  private argsValidator = Joi.object({
    version: Joi.string().optional(),
  });
  public validateSchema(args: IPInputArgs): void {
    try {
      // validate arguments schema
      Joi.assert(args, this.argsValidator);
    } catch {
      throw new Error('The arguments schema for date type is incorrect');
    }
  }
  public validateData(value: string, args: IPInputArgs): void {
    let schema = Joi.string().ip();
    // if there are args passed
    if (!isUndefined(args)) {
      schema = args.version
        ? Joi.string().ip({
            version: args.version,
          })
        : schema;
    }
    try {
      // validate data value
      Joi.assert(value, schema);
    } catch {
      throw new Error('The input parameter is invalid, it should be ip type');
    }
  }
}
