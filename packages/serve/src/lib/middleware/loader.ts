import { BaseRouteMiddleware } from './middleware';
import { defaultImport, ClassType } from '@vulcan/core';
// The extension module interface
export interface ExtensionModule {
  middlewares?: ClassType<BaseRouteMiddleware>[];
}

export const loadExtensions = async (folder?: string) => {
  // if extension path setup, load middlewares classes in the folder
  if (folder) {
    // import extension which user customized
    const module = await defaultImport<ExtensionModule>(folder);
    // return middleware classes in folder
    return module.middlewares || [];
  }
  return [];
};
