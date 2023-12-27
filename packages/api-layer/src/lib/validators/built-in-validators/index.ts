// export all other non-default objects of validators module
export * from './dateTypeValidator';
export * from './integerTypeValidator';
export * from './stringTypeValidator';
export * from './uuidTypeValidator';
export * from './requiredValidator';
export * from './enumValidator';

// import default objects and export
import { DateTypeValidator } from './dateTypeValidator';
import { IntegerTypeValidator } from './integerTypeValidator';
import { StringTypeValidator } from './stringTypeValidator';
import { UUIDTypeValidator } from './uuidTypeValidator';
import { RequiredValidator } from './requiredValidator';
import { EnumValidator } from './enumValidator';

export default [
  DateTypeValidator,
  IntegerTypeValidator,
  StringTypeValidator,
  UUIDTypeValidator,
  RequiredValidator,
  EnumValidator,
];
