import {
  InputValidator,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer/models';
import * as Joi from 'joi';
import { GuidVersions } from 'joi';
import { isUndefined } from 'lodash';
import { ConfigurationError, UserError } from '../../utils/errors';
import { Constraint } from '../constraints';

type UUIDVersion = 'uuid_v1' | 'uuid_v4' | 'uuid_v5';

export interface UUIDInputArgs {
  // The uuid supported version, including uuidv1, uuidv4, uuidv5
  version?: UUIDVersion;
}

@VulcanInternalExtension()
@VulcanExtensionId('uuid')
export class UUIDTypeValidator extends InputValidator {
  // Validator for arguments schema in schema.yaml, should match UUIDInputArgs
  private argsValidator = Joi.object({
    version: Joi.string().optional(),
  });

  validateSchema(args: UUIDInputArgs) {
    try {
      // validate arguments schema
      Joi.assert(args, this.argsValidator);
    } catch {
      throw new ConfigurationError(
        'The arguments schema for "uuid" type validator is incorrect'
      );
    }
  }

  public validateData(value: string, args: UUIDInputArgs) {
    // schema is string type
    let schema = Joi.string().uuid();

    // if there are args passed
    if (!isUndefined(args)) {
      // support uuid version if input field existed
      schema = args.version
        ? Joi.string().uuid({
            // remove "_" and convert to Joi supported type
            version: args.version.replace('_', '') as GuidVersions,
          })
        : Joi.string().uuid();
    }
    try {
      // validate data value
      Joi.assert(value, schema);
    } catch {
      throw new UserError(
        'The input parameter is invalid, it should be uuid type'
      );
    }
  }

  public override getConstraints() {
    const constraints: Constraint[] = [Constraint.Type('string')];
    return constraints;
  }
}
