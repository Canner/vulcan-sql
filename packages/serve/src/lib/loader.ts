import { BaseResponseFormatter } from './response-formatter';
import {
  defaultImport,
  ClassType,
  ModuleProperties,
  mergedModules,
  SourceOfExtensions,
} from '@vulcan-sql/core';
import { BaseRouteMiddleware } from './middleware';
import { AppConfig } from '../models';
// The extension module interface
export interface ExtensionModule extends ModuleProperties {
  ['middlewares']: ClassType<BaseRouteMiddleware>[];
  ['response-formatter']: ClassType<BaseResponseFormatter>[];
}

type ExtensionName = 'middlewares' | 'response-formatter';

export const importExtensions = async (
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

/**
 * load components which inherit supper vulcan component class, may contains built-in or extensions
 * @param classesOfComponent the classes of component which inherit supper vulcan component class
 * @returns the created instance
 */
export const loadComponents = async <T extends { name: string }>(
  classesOfComponent: ClassType<T>[],
  config?: AppConfig
): Promise<{ [name: string]: T }> => {
  const map: { [name: string]: T } = {};
  // create each extension
  for (const cls of classesOfComponent) {
    const component = new cls(config) as T;
    if (component.name in map) {
      throw new Error(
        `The identifier name "${component.name}" of component class ${cls.name} has been defined in other extensions`
      );
    }
    map[component.name] = component;
  }
  return map;
};
