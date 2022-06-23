import { Constraint } from './constraints';

export interface IValidator<T = any> {
  // validator name
  name: string;
  // validate Schema format
  validateSchema(args: T): boolean;
  // validate input data
  validateData(data: string, args: T): boolean;
  // TODO: Find a better way to get constraints.
  // Get the constraints of this validator
  getConstraints?(args: T): Constraint[];
}
