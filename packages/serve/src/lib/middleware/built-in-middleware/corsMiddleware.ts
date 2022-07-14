import * as Koa from 'koa';
import * as cors from '@koa/cors';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import { BuiltInMiddleware, RouteMiddlewareNext } from '../middleware';
import { MiddlewareConfig } from '@vulcan-sql/serve/models';

export type CorsOptions = cors.Options;

export class CorsMiddleware extends BuiltInMiddleware {
  private koaCors: Koa.Middleware;

  constructor(config: MiddlewareConfig) {
    super('cors', config);
    const options = this.getOptions() as CorsOptions;
    this.koaCors = cors(options);
  }
  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    if (!this.enabled) return next();
    return this.koaCors(context, next);
  }
}
