import { TYPES } from '@vulcan-sql/core/types';
import { Constraint } from '@vulcan-sql/core/validators';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

@VulcanExtension(TYPES.Extension_InputValidator)
export abstract class InputValidator<U = any, T = any> extends ExtensionBase {
  // validator name
  abstract readonly name: string;
  // validate Schema format
  abstract validateSchema(args: T): void;
  // validate input value
  abstract validateData(value: U, args?: T): void;
  // TODO: Find a better way to get constraints.
  // Get the constraints of this validator
  public getConstraints?(args: T): Constraint[];
}
