import { APISchema, IValidatorLoader } from '@vulcan-sql/core';
import { chain } from 'lodash';
import { SchemaParserMiddleware } from './middleware';

export const setConstraints =
  (loader: IValidatorLoader): SchemaParserMiddleware =>
  async (rawSchema, next) => {
    await next();
    const schema = rawSchema as APISchema;

    for (const request of schema.request || []) {
      // load validator and keep args
      const validatorsWithArgs = await Promise.all(
        (request.validators || []).map(async (validator) => ({
          validator: await loader.load(validator.name),
          args: validator.args,
        }))
      );
      // set constraint by validator and args
      request.constraints = chain(validatorsWithArgs)
        .filter(({ validator }) => !!validator.getConstraints)
        .flatMap(({ validator, args }) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          validator.getConstraints!(args)
        ) // Group by constraint class (RequiredConstraint, MinValueConstraint ....)
        .groupBy((constraint) => constraint.constructor.name)
        .values()
        .map((constraints) => {
          let mergeConstraint = constraints[0];
          constraints
            .slice(1)
            .forEach(
              (constraint) =>
                (mergeConstraint = mergeConstraint.compose(constraint))
            );
          return mergeConstraint;
        })
        .value();
    }
  };
