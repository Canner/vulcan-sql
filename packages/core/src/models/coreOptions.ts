import { IArtifactBuilderOptions } from './artifactBuilderOptions';
import { ITemplateEngineOptions } from './templateEngineOptions';

export type SourceOfExtensions = Array<string>;

export interface ICoreOptions {
  artifact: IArtifactBuilderOptions;
  template: ITemplateEngineOptions;
  /**
   * The extensions, could be module name or folder path (which need index.ts)
   * E.g: [ 'extensionModule1', '/usr/extensions2' ]
   *  */
  extensions?: SourceOfExtensions;
}
