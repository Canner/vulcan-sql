import { Constraint } from './constraints';

// U generic type will be any from RequestParameters
export interface IValidator<U = any, T = any> {
  // validator name
  readonly name: string;
  // validate Schema format
  validateSchema(args: T): void;
  // validate input value
  validateData(value: U, args?: T): void;
  // TODO: Find a better way to get constraints.
  // Get the constraints of this validator
  getConstraints?(args: T): Constraint[];
}
