import { IArtifactBuilderOptions } from './artifactBuilderOptions';
import { IDocumentOptions } from './documentOptions';
import { IExecutorOptions } from './executorOptions';
import { ITemplateEngineOptions } from './templateEngineOptions';

/**
 * Extension alias
 * Its values can be string or string[] like below:
 * aModule: 'path/to/module'
 * moduleGroup:
 *   - 'bModule'
 *   - 'cModule'
 * Modules with the same alias share the same config.
 */
export type ExtensionAliases = Record<string, string | string[]>;

export interface ICoreOptions {
  name?: string;
  description?: string;
  version?: string;
  artifact: IArtifactBuilderOptions;
  template?: ITemplateEngineOptions;
  executor?: IExecutorOptions;
  extensions?: ExtensionAliases;
  document?: IDocumentOptions;
  [moduleAlias: string]: any;
}
