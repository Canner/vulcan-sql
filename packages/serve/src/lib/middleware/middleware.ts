import { KoaRouterContext } from '@route/route-component';
import { Next } from 'koa';
import { ServeConfig } from '../config';

export type RouteMiddlewareNext = Next;

export abstract class BaseRouteMiddleware {
  protected config: ServeConfig;
  // Is an identifier to check the options set or not in the middlewares section of serve config
  public readonly keyName: string;
  constructor(keyName: string, config: ServeConfig) {
    this.keyName = keyName;
    this.config = config;
  }
  public abstract handle(
    context: KoaRouterContext,
    next: RouteMiddlewareNext
  ): Promise<void>;
}
