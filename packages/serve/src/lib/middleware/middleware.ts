import {
  BuiltInOptions,
  AppConfig,
  MiddlewareConfig,
} from '@vulcan-sql/serve/models';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import { Next } from 'koa';

export type RouteMiddlewareNext = Next;

export abstract class BaseRouteMiddleware {
  protected config: MiddlewareConfig;
  // middleware is enabled or not, default is enabled beside you give "enabled: false" in config.
  protected enabled: boolean;
  // An identifier to check the options set or not in the middlewares section of serve config
  public readonly name: string;
  constructor(name: string, config: MiddlewareConfig) {
    this.name = name;
    this.config = config;
    this.enabled = (this.getConfig()?.['enabled'] as boolean) || true;
  }
  public abstract handle(
    context: KoaRouterContext,
    next: RouteMiddlewareNext
  ): Promise<void>;

  protected getConfig() {
    if (this.config && this.config[this.name]) return this.config[this.name];
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
