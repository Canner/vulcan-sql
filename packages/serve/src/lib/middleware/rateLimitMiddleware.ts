import { RateLimit, RateLimitOptions } from 'koa2-ratelimit';
import { BuiltInMiddleware, KoaContext, Next } from '@vulcan-sql/serve/models';
import { VulcanInternalExtension } from '@vulcan-sql/core';

export { RateLimitOptions };

@VulcanInternalExtension('rate-limit')
export class RateLimitMiddleware extends BuiltInMiddleware<RateLimitOptions> {
  private koaRateLimit = RateLimit.middleware(this.getOptions());

  public async handle(context: KoaContext, next: Next) {
    if (!this.enabled) return next();
    return this.koaRateLimit(context, next);
  }
}
