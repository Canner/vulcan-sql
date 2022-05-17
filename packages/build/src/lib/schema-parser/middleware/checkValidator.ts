import { SchemaParserMiddleware } from './middleware';
import { chain } from 'lodash';
import { APISchema, ValidatorLoader } from '@vulcan/core';

export const checkValidator =
  (loader: ValidatorLoader): SchemaParserMiddleware =>
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

      const validator = loader.getLoader(validatorRequest.name);

      // TODO: indicate the detail of error
      if (!validator.validateSchema(validatorRequest.args)) {
        throw new Error(`Validator ${validatorRequest.name} schema invalid`);
      }
    }
  };
