import {
  APISchema,
  IValidatorLoader,
  RequestSchema,
  ValidatorDefinition,
} from '@vulcan/core';

import { RequestParameters } from './requestTransformer';

export interface IRequestValidator {
  validate(reqParams: RequestParameters, apiSchema: APISchema): Promise<void>;
}

export class RequestValidator implements IRequestValidator {
  private validatorLoader: IValidatorLoader;
  constructor(loader: IValidatorLoader) {
    this.validatorLoader = loader;
  }
  // validate each parameters of request and transform the request content of koa ctx to "RequestParameters" format
  public async validate(reqParams: RequestParameters, apiSchema: APISchema) {
    await Promise.all(
      apiSchema.request.map(async (schemaParam: RequestSchema) => {
        const { fieldName, validators } = schemaParam;
        // validate format through validators
        await this.validateFieldFormat(reqParams[fieldName], validators);
      })
    );
  }
  // validate one parameter by input validator
  private async validateFieldFormat(
    fieldValue: string,
    schemaValidators: Array<ValidatorDefinition>
  ) {
    await Promise.all(
      schemaValidators.map(async (schemaValidator) => {
        const validator = await this.validatorLoader.load(schemaValidator.name);
        validator.validateData(fieldValue, schemaValidator.args);
      })
    );
  }
}
