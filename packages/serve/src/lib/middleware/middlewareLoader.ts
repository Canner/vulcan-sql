import * as path from 'path';
import { BaseRouteMiddleware } from './middleware';
import { ModuleLoader, Type } from '@vulcan/core';
import { ServeConfig } from '../config';

// The extension module interface
export interface ExtensionModule {
  middlewares?: Type<BaseRouteMiddleware>[];
}

export interface IRouteMiddlewareLoader {
  load(): Promise<Type<BaseRouteMiddleware>[]>;
}

export class RouteMiddlewareLoader
  extends ModuleLoader
  implements IRouteMiddlewareLoader
{
  // middleware config
  private config: ServeConfig;
  // the extension module name
  private builtInFolder = path.join(__dirname, 'built-in-middlewares');
  constructor(config: ServeConfig) {
    super();
    this.config = config;
  }
  public async load() {
    // read built-in middlewares in index.ts, the content is an array middleware class
    const builtInClass = await this.import<Type<BaseRouteMiddleware>[]>(
      this.builtInFolder
    );

    // if extension path setup, load extension middlewares classes
    let extensionClass: Type<BaseRouteMiddleware>[] = [];
    if (this.config.extension) {
      // import extension which user customized
      const module = await this.import<ExtensionModule>(this.config.extension);
      extensionClass = module.middlewares || [];
    }
    // return all middleware classes in built-in and extension
    return [...builtInClass, ...extensionClass];
  }
}
