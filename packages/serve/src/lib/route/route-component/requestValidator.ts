import {
  APISchema,
  IValidatorLoader,
  RequestSchema,
  ValidatorDefinition,
} from '@vulcan-sql/core';
import { inject, injectable } from 'inversify';
import { TYPES as CORE_TYPES } from '@vulcan-sql/core';
import { RequestParameters } from './requestTransformer';

export interface IRequestValidator {
  validate(reqParams: RequestParameters, apiSchema: APISchema): Promise<void>;
}

@injectable()
export class RequestValidator implements IRequestValidator {
  private validatorLoader: IValidatorLoader;
  constructor(@inject(CORE_TYPES.ValidatorLoader) loader: IValidatorLoader) {
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
    fieldValue: any,
    schemaValidators: Array<ValidatorDefinition>
  ) {
    await Promise.all(
      schemaValidators.map(async (schemaValidator) => {
        const validator = this.validatorLoader.getValidator(
          schemaValidator.name
        );
        validator.validateData(fieldValue, schemaValidator.args);
      })
    );
  }
}
