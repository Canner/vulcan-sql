/* eslint-disable @typescript-eslint/no-empty-function */
import { InputValidator, VulcanExtensionId } from '@vulcan-sql/core';

// Imitate extension for testing
@VulcanExtensionId('v2-1')
export class Validator21 extends InputValidator {
  validateSchema() {}
  validateData() {}
}
@VulcanExtensionId('v2-2')
export class Validator22 extends InputValidator {
  validateSchema() {}
  validateData() {}
}
