// import built-in validators
import builtInValidatorClasses from './lib/validators';
import IValidator from './lib/validators/validator';

// TODO: Import user-defined validators dynamically in specific directory

// defined all validators and change to key-value object format for export
const loadedValidators: { [name: string]: IValidator } = Object.assign(
  {},
  ...builtInValidatorClasses.map((validatorClass) => {
    const validator = new validatorClass();
    return {
      [validator.name as string]: validator,
    };
  })
);

// export all other non-default objects of validators module
export * from './lib/validators';
// Export all other modules
export * from './models';
export * from './lib/utils';
export * from './lib/validators/validator';
export * from './lib/template-engine';
export * from './lib/artifact-builder';
export * from './containers';

export { loadedValidators, IValidator };
