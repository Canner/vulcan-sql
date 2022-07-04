/**
 * Add reflect metadata to collect inversify IOC decorator information
 * TODO: This is a temporarily handle way, after rebase done, need to remove it with using toDynamicValue and use inject options way to do.
 */
import 'reflect-metadata';

// Data Type Validators
export * from './validatorLoader';
export * from './constraints';

export { IntInputArgs } from './data-type-validators/integerTypeValidator';
export { DateInputArgs } from './data-type-validators/dateTypeValidator';
export { StringInputArgs } from './data-type-validators/stringTypeValidator';
export { UUIDInputArgs } from './data-type-validators/uuidTypeValidator';

// import default objects and export
import IValidator from './validator';
import DateTypeValidator from './data-type-validators/dateTypeValidator';
import IntegerTypeValidator from './data-type-validators/integerTypeValidator';
import StringTypeValidator from './data-type-validators/stringTypeValidator';
import UUIDTypeValidator from './data-type-validators/uuidTypeValidator';
import RequiredValidator from './data-type-validators/requiredValidator';

export {
  IValidator,
  DateTypeValidator,
  IntegerTypeValidator,
  StringTypeValidator,
  UUIDTypeValidator,
  RequiredValidator,
};
