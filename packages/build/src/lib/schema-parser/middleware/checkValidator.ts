import { RawAPISchema, SchemaParserMiddleware } from './middleware';
import { chain } from 'lodash';
import {
  APISchema,
  IValidatorLoader,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/core';
import { inject } from 'inversify';

export class CheckValidator extends SchemaParserMiddleware {
  private validatorLoader: IValidatorLoader;

  constructor(
    @inject(CORE_TYPES.ValidatorLoader) validatorLoader: IValidatorLoader
  ) {
    super();
    this.validatorLoader = validatorLoader;
  }

  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    await next();
    const transformedSchemas = schemas as APISchema;
    const validators = chain(transformedSchemas.request)
      .flatMap((req) => req.validators)
      .value();

    for (const validatorRequest of validators) {
      if (!validatorRequest.name) {
        throw new Error('Validator name is required');
      }

      const validator = await this.validatorLoader.load(validatorRequest.name);

      // TODO: indicate the detail of error
      validator.validateSchema(validatorRequest.args);
    }
  }
}
