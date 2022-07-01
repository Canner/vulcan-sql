import { IArtifactBuilderOptions } from './artifactBuilderOptions';
import { ITemplateEngineOptions } from './templateEngineOptions';

export interface ICoreOptions {
  artifact: IArtifactBuilderOptions;
  template: ITemplateEngineOptions;
}
