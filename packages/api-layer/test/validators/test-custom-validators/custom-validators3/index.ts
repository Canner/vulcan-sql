/* eslint-disable @typescript-eslint/no-empty-function */
import { InputValidator, VulcanExtensionId } from '@vulcan-sql/api-layer';

@VulcanExtensionId('v3-1')
export class Validator31 extends InputValidator {
  validateSchema() {}
  validateData() {}
}
@VulcanExtensionId('v1-1') // Test for id conflict
export class Validator32 extends InputValidator {
  validateSchema() {}
  validateData() {}
}
