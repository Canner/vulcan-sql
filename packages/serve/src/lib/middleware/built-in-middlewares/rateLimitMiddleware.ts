import * as Koa from 'koa';
import { RateLimit, RateLimitOptions } from 'koa2-ratelimit';
import { KoaRouterContext } from '@route/.';
import { BuiltInMiddleware, RouteMiddlewareNext } from '../middleware';
import { ServeConfig } from '@config';

export { RateLimitOptions };

export class RateLimitMiddleware extends BuiltInMiddleware {
  private koaRateLimit: Koa.Middleware;
  constructor(config: ServeConfig) {
    super('rate-limit', config);

    const options = this.getOptions() as RateLimitOptions;
    this.koaRateLimit = RateLimit.middleware(options);
  }

  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    if (!this.enabled) return next();
    return this.koaRateLimit(context, next);
  }
}
