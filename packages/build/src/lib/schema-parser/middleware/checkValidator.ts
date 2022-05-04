import { ValidatorLoader } from '../schema-parser';
import { SchemaParserMiddleware } from './middleware';
import { chain } from 'lodash';

export const checkValidator =
  (loader: ValidatorLoader): SchemaParserMiddleware =>
  async (schemas, next) => {
    await next();
    const validators = chain(schemas.request)
      .flatMap((req) => req.validators)
      .value();

    for (const validatorRequest of validators) {
      if (!validatorRequest || !validatorRequest.name) {
        throw new Error('Validator name is required');
      }

      const validator = loader.getLoader(validatorRequest.name);

      // TODO: indicate the detail of error
      if (!validator.validateSchema(validatorRequest.args)) {
        throw new Error(`Validator ${validatorRequest.name} schema invalid`);
      }
    }
  };
