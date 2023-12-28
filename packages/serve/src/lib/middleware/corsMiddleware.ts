import * as cors from '@koa/cors';
import { BuiltInMiddleware, KoaContext, Next } from '@vulcan-sql/serve/models';
import { VulcanInternalExtension } from '@vulcan-sql/core';

export type CorsOptions = cors.Options;

@VulcanInternalExtension('cors')
export class CorsMiddleware extends BuiltInMiddleware<CorsOptions> {
  private koaCors = cors(this.getOptions());

  public async handle(context: KoaContext, next: Next) {
    if (!this.enabled) return next();
    return this.koaCors(context, next);
  }
}
