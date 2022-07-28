import { BaseResponseFormatter } from './response-formatter';
import {
  defaultImport,
  ClassType,
  ModuleProperties,
  mergedModules,
  SourceOfExtensions,
} from '@vulcan-sql/core';
import { BaseRouteMiddleware } from './middleware';
// The extension module interface
export interface ExtensionModule extends ModuleProperties {
  ['middlewares']: ClassType<BaseRouteMiddleware>[];
  ['response-formatter']: ClassType<BaseResponseFormatter>[];
}

type ExtensionName = 'middlewares' | 'response-formatter';

export const loadExtensions = async (
  name: ExtensionName,
  extensions?: SourceOfExtensions
) => {
  // if extensions setup, load response formatter classes in the extensions
  if (extensions) {
    // import extension which user customized
    const modules = await defaultImport<ExtensionModule>(...extensions);
    const module = await mergedModules<ExtensionModule>(modules);
    // return middleware classes in folder
    return module[name] || [];
  }
  return [];
};
