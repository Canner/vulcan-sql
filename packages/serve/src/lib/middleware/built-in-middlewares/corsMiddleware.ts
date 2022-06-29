import * as Koa from 'koa';
import * as cors from '@koa/cors';
import { KoaRouterContext } from '@route/.';
import { BuiltInMiddleware, RouteMiddlewareNext } from '../middleware';
import { ServeConfig } from '@config';

export type CorsOptions = cors.Options;

export class CorsMiddleware extends BuiltInMiddleware {
  private koaCors: Koa.Middleware;

  constructor(config: ServeConfig) {
    super('cors', config);
    const options = this.getOptions() as CorsOptions;
    this.koaCors = cors(options);
  }
  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    if (!this.enabled) await next();
    else return this.koaCors(context, next);
  }
}
