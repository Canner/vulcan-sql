/* eslint-disable @typescript-eslint/no-empty-function */
import { InputValidator } from '@vulcan-sql/core';

// Imitate extension for testing
export class Validator11 extends InputValidator {
  name = 'v1-1';
  validateSchema() {}
  validateData() {}
}
export class Validator12 extends InputValidator {
  name = 'v1-2';
  validateSchema() {}
  validateData() {}
}
