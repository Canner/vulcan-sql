import {
  BuiltInOptions,
  AppConfig,
  MiddlewareConfig,
} from '@vulcan/serve/models';
import { KoaRouterContext } from '@vulcan/serve/route';
import { Next } from 'koa';

export type RouteMiddlewareNext = Next;

export abstract class BaseRouteMiddleware {
  protected config: MiddlewareConfig;
  // middleware is enabled or not, default is enabled beside you give "enabled: false" in config.
  protected enabled: boolean;
  // Is an identifier to check the options set or not in the middlewares section of serve config
  public readonly keyName: string;
  constructor(keyName: string, config: MiddlewareConfig) {
    this.keyName = keyName;
    this.config = config;
    this.enabled = (this.getConfig()?.['enabled'] as boolean) || true;
  }
  public abstract handle(
    context: KoaRouterContext,
    next: RouteMiddlewareNext
  ): Promise<void>;

  protected getConfig() {
    if (this.config && this.config[this.keyName])
      return this.config[this.keyName];
    return undefined;
  }
}

export abstract class BuiltInMiddleware extends BaseRouteMiddleware {
  protected getOptions() {
    if (this.getConfig())
      return this.getConfig()?.['options'] as BuiltInOptions;
    return undefined;
  }
}
