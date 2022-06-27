import * as path from 'path';
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

export const loadBuiltIn = async () => {
  // built-in middleware folder
  const builtInFolder = path.join(__dirname, 'built-in-middlewares');
  // read built-in middlewares in index.ts, the content is an array middleware class
  return (
    (await defaultImport<ClassType<BaseRouteMiddleware>[]>(builtInFolder)) || []
  );
};
