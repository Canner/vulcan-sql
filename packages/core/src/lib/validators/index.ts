// Data Type Validators
export * from './validatorLoader';
export * from './constraints';

import { IntInputArgs, IntegerTypeValidator } from './data-type-validators';
import { DateInputArgs, DateTypeValidator } from './data-type-validators';
import { StringInputArgs, StringTypeValidator } from './data-type-validators';
import { UUIDInputArgs, UUIDTypeValidator } from './data-type-validators';

// TODO: Other Built-in Validators

// export all validators needed args interface
export { IntInputArgs, DateInputArgs, StringInputArgs, UUIDInputArgs };

// export default all validators of IValidator for use
export default [
  DateTypeValidator,
  IntegerTypeValidator,
  StringTypeValidator,
  UUIDTypeValidator,
];
