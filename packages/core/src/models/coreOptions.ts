import { IArtifactBuilderOptions } from './artifactBuilderOptions';
import { IExecutorOptions } from './executorOptions';
import { ITemplateEngineOptions } from './templateEngineOptions';

export type ExtensionAliases = Record<string, string | string[]>;

export interface ICoreOptions {
  name?: string;
  description?: string;
  version?: string;
  artifact: IArtifactBuilderOptions;
  template?: ITemplateEngineOptions;
  executor?: IExecutorOptions;
  /**
   * The extensions, could be module name or folder path (which need index.ts)
   * E.g: [ 'extensionModule1', '/usr/extensions2' ]
   *  */
  extensions?: ExtensionAliases;
  [moduleAlias: string]: any;
}
