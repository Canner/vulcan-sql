import * as Koa from 'koa';
import { RateLimit, RateLimitOptions } from 'koa2-ratelimit';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';
import { BuiltInMiddleware } from '../middleware';
import { AppConfig } from '@vulcan-sql/serve/models';

export { RateLimitOptions };

export class RateLimitMiddleware extends BuiltInMiddleware {
  private koaRateLimit: Koa.Middleware;
  constructor(config: AppConfig) {
    super('rate-limit', config);

    const options = this.getOptions() as RateLimitOptions;
    this.koaRateLimit = RateLimit.middleware(options);
  }

  public async handle(context: KoaRouterContext, next: KoaNext) {
    if (!this.enabled) return next();
    return this.koaRateLimit(context, next);
  }
}
