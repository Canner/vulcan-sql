import { SchemaParserMiddleware } from './middleware';
import { chain } from 'lodash';
import { APISchema, IValidatorLoader } from '@vulcan-sql/core';

export const checkValidator =
  (loader: IValidatorLoader): SchemaParserMiddleware =>
  async (schemas, next) => {
    await next();
    const transformedSchemas = schemas as APISchema;
    const validators = chain(transformedSchemas.request)
      .flatMap((req) => req.validators)
      .value();

    for (const validatorRequest of validators) {
      if (!validatorRequest.name) {
        throw new Error('Validator name is required');
      }

      const validator = await loader.load(validatorRequest.name);

      // TODO: indicate the detail of error
      validator.validateSchema(validatorRequest.args);
    }
  };
