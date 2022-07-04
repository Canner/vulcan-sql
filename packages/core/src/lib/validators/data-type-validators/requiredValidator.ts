import * as Joi from 'joi';
import { isEmpty } from 'lodash';
import { IValidator } from '../validator';

export interface RequiredInputArgs {
  /**
   * Beside undefined not be required, which input also not as required value.
   * e.g: disallow: ['', {}] means, undefined,'', {} also disallow
   *  */
  disallow?: string[];
}

// required means disallow undefined as value
export class RequiredValidator implements IValidator {
  public readonly name = 'required';
  // Validator for arguments schema in schema.yaml, should match RequiredInputArgs
  private argsValidator = Joi.object({
    excluded: Joi.array().items(Joi.any()).optional(),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public validateSchema(args: RequiredInputArgs) {
    try {
      // validate arguments schema
      Joi.assert(args, this.argsValidator);
    } catch {
      throw new Error(
        'The arguments schema for "required" type validator is incorrect'
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public validateData(value: string, args?: RequiredInputArgs) {
    const schema = Joi.any().required();

    try {
      // check is undefined
      Joi.assert(value, schema);
      // if args.exclude existed, check value is
      if (args && !isEmpty(args.disallow)) {
        schema.disallow(args.disallow);
      }
      Joi.assert(value, this.argsValidator);
    } catch {
      throw new Error('The input parameter is invalid, it should be required');
    }
  }
}
