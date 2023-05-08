import { IArtifactBuilderOptions } from './artifactBuilderOptions';
import { ICacheLayerOptions } from './cacheLayerOptions';
import { IDocumentOptions } from './documentOptions';
import { IProfilesLookupOptions } from './profilesLookupOptions';
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
  extensions?: ExtensionAliases;
  document?: IDocumentOptions;
  profiles?: IProfilesLookupOptions;
  cache?: ICacheLayerOptions;
  [moduleAlias: string]: any;
}
