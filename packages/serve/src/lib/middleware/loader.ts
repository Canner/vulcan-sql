import { BaseRouteMiddleware } from './middleware';
import {
  defaultImport,
  ClassType,
  ModuleProperties,
  mergedModules,
  SourceOfExtensions,
} from '@vulcan-sql/core';
// The extension module interface
export interface ExtensionModule extends ModuleProperties {
  ['middlewares']: ClassType<BaseRouteMiddleware>[];
}

export const loadExtensions = async (extensions?: SourceOfExtensions) => {
  // if extensions setup, load middlewares classes in the extensions
  if (extensions) {
    // import extension which user customized
    const modules = await defaultImport<ExtensionModule>(...extensions);
    const module = await mergedModules<ExtensionModule>(modules);
    // return middleware classes in folder
    return module['middlewares'] || [];
  }
  return [];
};
