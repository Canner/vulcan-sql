import * as Koa from 'koa';
import * as cors from '@koa/cors';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';
import { BuiltInMiddleware } from '../middleware';
import { AppConfig } from '@vulcan-sql/serve/models';

export type CorsOptions = cors.Options;

export class CorsMiddleware extends BuiltInMiddleware {
  private koaCors: Koa.Middleware;

  constructor(config: AppConfig) {
    super('cors', config);
    const options = this.getOptions() as CorsOptions;
    this.koaCors = cors(options);
  }
  public async handle(context: KoaRouterContext, next: KoaNext) {
    if (!this.enabled) return next();
    return this.koaCors(context, next);
  }
}
