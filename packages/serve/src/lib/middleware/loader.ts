import { BaseRouteMiddleware } from './middleware';
import {
  defaultImport,
  ClassType,
  mergedModules,
  SourceOfExtensions,
} from '@vulcan/core';
// The extension module interface
export interface ExtensionModule {
  middlewares?: ClassType<BaseRouteMiddleware>[];
}

export const loadExtensions = async (extensions?: SourceOfExtensions) => {
  // if extensions setup, load middlewares classes in the extensions
  if (extensions) {
    // import extension which user customized
    const modules = await defaultImport<ExtensionModule>(...extensions);
    const module = await mergedModules<ExtensionModule>(modules);
    // return middleware classes in folder
    return module.middlewares || [];
  }
  return [];
};
