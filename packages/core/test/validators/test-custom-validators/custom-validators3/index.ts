/* eslint-disable @typescript-eslint/no-empty-function */
import { IValidator } from '@vulcan/core';

export default {
  validators: [
    class Validator implements IValidator {
      name = 'v3-1';
      validateSchema() {}
      validateData() {}
    },
    class Validator implements IValidator {
      name = 'v1-1';
      validateSchema() {}
      validateData() {}
    },
  ],
  others: [],
};
