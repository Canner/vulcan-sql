// export all other non-default objects of validators module
export * from './data-type-validators/dateTypeValidator';
export * from './data-type-validators/integerTypeValidator';
export * from './data-type-validators/stringTypeValidator';
export * from './data-type-validators/uuidTypeValidator';
export * from './validatorLoader';

// import default objects and export
import IValidator from './validator';
import DateTypeValidator from './data-type-validators/dateTypeValidator';
import IntegerTypeValidator from './data-type-validators/integerTypeValidator';
import StringTypeValidator from './data-type-validators/stringTypeValidator';
import UUIDTypeValidator from './data-type-validators/uuidTypeValidator';

export {
  IValidator,
  DateTypeValidator,
  IntegerTypeValidator,
  StringTypeValidator,
  UUIDTypeValidator,
};
