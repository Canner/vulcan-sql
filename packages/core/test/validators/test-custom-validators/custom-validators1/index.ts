/* eslint-disable @typescript-eslint/no-empty-function */
import { IValidator } from '@vulcan-sql/core';

// Imitate extension for testing
export default {
  validators: [
    class Validator implements IValidator {
      name = 'v1-1';
      validateSchema() {}
      validateData() {}
    },
    class Validator implements IValidator {
      name = 'v1-2';
      validateSchema() {}
      validateData() {}
    },
  ],
  middlewares: [],
};
