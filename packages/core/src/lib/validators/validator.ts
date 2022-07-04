import { Constraint } from './constraints';

export interface IValidator<T = any> {
  // validator name
  readonly name: string;
  // validate Schema format
  validateSchema(args: T): void;
  // validate input value
  validateData(value: string, args?: T): void;
  // TODO: Find a better way to get constraints.
  // Get the constraints of this validator
  getConstraints?(args: T): Constraint[];
}
