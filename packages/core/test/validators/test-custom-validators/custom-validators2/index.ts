/* eslint-disable @typescript-eslint/no-empty-function */
import { IValidator } from '@vulcan-sql/core';

// Imitate extension for testing
export default {
  validators: [
    class Validator implements IValidator {
      name = 'v2-1';
      validateSchema() {}
      validateData() {}
    },
    class Validator implements IValidator {
      name = 'v2-2';
      validateSchema() {}
      validateData() {}
    },
  ],
  others: [],
};
