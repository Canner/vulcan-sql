import * as cors from '@koa/cors';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';
import { BuiltInMiddleware } from '@vulcan-sql/serve/models';
import { VulcanInternalExtension } from '@vulcan-sql/core';

export type CorsOptions = cors.Options;

@VulcanInternalExtension('cors')
export class CorsMiddleware extends BuiltInMiddleware<CorsOptions> {
  private koaCors = cors(this.getOptions());

  public async handle(context: KoaRouterContext, next: KoaNext) {
    if (!this.enabled) return next();
    return this.koaCors(context, next);
  }
}
