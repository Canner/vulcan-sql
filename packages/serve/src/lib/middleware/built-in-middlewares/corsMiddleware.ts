import * as Koa from 'koa';
import * as cors from '@koa/cors';
import { KoaRouterContext } from '@route/.';
import { BaseRouteMiddleware, RouteMiddlewareNext } from '../middleware';
import { ServeConfig } from '@config';

export type CorsOptions = cors.Options;

export class CorsMiddleware extends BaseRouteMiddleware {
  private koaCors: Koa.Middleware;

  constructor(config: ServeConfig) {
    super('cors', config);
    const options = config.middlewares
      ? (config.middlewares[this.keyName] as CorsOptions)
      : undefined;
    this.koaCors = cors(options);
  }
  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    return this.koaCors(context, next);
  }
}
