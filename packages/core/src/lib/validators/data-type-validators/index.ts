// export all other non-default objects of validators module
export * from './dateTypeValidator';
export * from './integerTypeValidator';
export * from './stringTypeValidator';
export * from './uuidTypeValidator';

// import default objects and export
import { DateTypeValidator } from './dateTypeValidator';
import { IntegerTypeValidator } from './integerTypeValidator';
import { StringTypeValidator } from './stringTypeValidator';
import { UUIDTypeValidator } from './uuidTypeValidator';

export default [
  DateTypeValidator,
  IntegerTypeValidator,
  StringTypeValidator,
  UUIDTypeValidator,
];
