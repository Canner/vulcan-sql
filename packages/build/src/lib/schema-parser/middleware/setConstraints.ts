import {
  APISchema,
  IValidatorLoader,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/core';
import { inject } from 'inversify';
import { chain } from 'lodash';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';

export class SetConstraints extends SchemaParserMiddleware {
  private validatorLoader: IValidatorLoader;

  constructor(
    @inject(CORE_TYPES.ValidatorLoader) validatorLoader: IValidatorLoader
  ) {
    super();
    this.validatorLoader = validatorLoader;
  }

  public async handle(rawSchema: RawAPISchema, next: () => Promise<void>) {
    await next();
    const schema = rawSchema as APISchema;

    for (const request of schema.request || []) {
      // load validator and keep args
      const validatorsWithArgs = await Promise.all(
        (request.validators || []).map(async (validator) => ({
          validator: this.validatorLoader.getValidator(validator.name),
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
  }
}
