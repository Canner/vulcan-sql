/* eslint-disable @typescript-eslint/no-empty-function */
import { InputValidator } from '@vulcan-sql/core';

// Imitate extension for testing
export class Validator21 extends InputValidator {
  name = 'v2-1';
  validateSchema() {}
  validateData() {}
}
export class Validator22 extends InputValidator {
  name = 'v2-2';
  validateSchema() {}
  validateData() {}
}
