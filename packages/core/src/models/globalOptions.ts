import { IArtifactBuilderOptions } from './artifactBuilderOptions';
import { ITemplateEngineOptions } from './templateEngineOptions';

export interface IGlobalOptions {
  artifact: IArtifactBuilderOptions;
  template: ITemplateEngineOptions;
}
