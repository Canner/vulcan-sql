import { RateLimit, RateLimitOptions } from 'koa2-ratelimit';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';
import { BuiltInMiddleware } from '@vulcan-sql/serve/models';
import { VulcanInternalExtension } from '@vulcan-sql/core';

export { RateLimitOptions };

@VulcanInternalExtension('rate-limit')
export class RateLimitMiddleware extends BuiltInMiddleware<RateLimitOptions> {
  private koaRateLimit = RateLimit.middleware(this.getOptions());

  public async handle(context: KoaRouterContext, next: KoaNext) {
    if (!this.enabled) return next();
    return this.koaRateLimit(context, next);
  }
}
