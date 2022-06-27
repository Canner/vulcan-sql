import { ServeConfig } from '@config';
import { BaseRouteMiddleware, RouteMiddlewareNext } from '@middleware/.';
import { KoaRouterContext } from '@route/route-component';

export class TestModeMiddleware extends BaseRouteMiddleware {
  private mode: boolean;
  constructor(config: ServeConfig) {
    super('test-mode', config);
    this.mode =
      config.middlewares && config.middlewares[this.keyName]
        ? (config.middlewares[this.keyName] as boolean)
        : false;
  }
  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    context.response.set('test-mode', String(this.mode));
    await next();
  }
}
