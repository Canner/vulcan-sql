/* eslint-disable @typescript-eslint/no-empty-function */
import { InputValidator, VulcanExtensionId } from '@vulcan-sql/core';

// Imitate extension for testing
@VulcanExtensionId('v1-1')
export class Validator11 extends InputValidator {
  validateSchema() {}
  validateData() {}
}
@VulcanExtensionId('v1-2')
export class Validator12 extends InputValidator {
  validateSchema() {}
  validateData() {}
}
