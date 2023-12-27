import { RateLimit, RateLimitOptions } from 'koa2-ratelimit';
import { BuiltInMiddleware, KoaContext, Next } from '@vulcan-sql/serve/models';
import { VulcanInternalExtension, TYPES as CORE_TYPES } from '@vulcan-sql/api-layer';
import { inject } from 'inversify';

export { RateLimitOptions };

@VulcanInternalExtension('rate-limit')
export class RateLimitMiddleware extends BuiltInMiddleware<RateLimitOptions> {
  private options: RateLimitOptions;
  private koaRateLimitFunc;
  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string
  ) {
    super(config, name);
    this.options = (this.getOptions() as RateLimitOptions) || { max: 60 };
    if (!this.options['max']) this.options['max'] = 60;
    this.koaRateLimitFunc = RateLimit.middleware(this.options);
  }

  public async handle(context: KoaContext, next: Next) {
    if (!this.enabled) return next();
    return this.koaRateLimitFunc(context, next);
  }
}
