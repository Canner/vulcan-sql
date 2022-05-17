import { injectable, inject } from 'inversify';
import { TYPES } from '@vulcan/core/containers';
import {
  ITemplateEngineOptions,
  TemplateProviderType,
} from '@vulcan/core/models';

@injectable()
export class TemplateEngineOptions implements ITemplateEngineOptions {
  public readonly provider!: TemplateProviderType;
  public readonly path!: string;

  constructor(
    @inject(TYPES.TemplateEngineInputOptions)
    options: ITemplateEngineOptions
  ) {
    Object.assign(this, options);
  }
}
