import { KoaRouterContext } from '@route/route-component';
import { Next } from 'koa';
import { BuiltInOptions, ServeConfig } from '../config';

export type RouteMiddlewareNext = Next;

export abstract class BaseRouteMiddleware {
  protected config: ServeConfig;
  // middleware is enabled or not, default is enabled beside you give "enabled: false" in config.
  protected enabled: boolean;
  // Is an identifier to check the options set or not in the middlewares section of serve config
  public readonly keyName: string;
  constructor(keyName: string, config: ServeConfig) {
    this.keyName = keyName;
    this.config = config;
    this.enabled = (this.getConfig()?.['enabled'] as boolean) || true;
  }
  public abstract handle(
    context: KoaRouterContext,
    next: RouteMiddlewareNext
  ): Promise<void>;

  protected getConfig() {
    if (this.config.middlewares && this.config.middlewares[this.keyName])
      return this.config.middlewares[this.keyName];
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
