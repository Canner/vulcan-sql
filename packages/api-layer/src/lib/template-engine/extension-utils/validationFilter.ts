import { InputValidator } from '@vulcan-sql/api-layer/models';

export const getValidationFilterName = (validator: InputValidator) => {
  return `is_${validator.getExtensionId()}`;
};

export const getValidatorName = (validationFilterName: string) => {
  return validationFilterName.replace('is_', '');
};
