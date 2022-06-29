import { ServeConfig } from '@config';
import { BaseRouteMiddleware, RouteMiddlewareNext } from '@middleware/.';
import { KoaRouterContext } from '@route/route-component';

export interface TestModeOptions {
  mode: boolean;
}

export class TestModeMiddleware extends BaseRouteMiddleware {
  private mode: boolean;
  constructor(config: ServeConfig) {
    super('test-mode', config);
    this.mode = (this.getConfig()?.['mode'] as boolean) || false;
  }
  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    context.response.set('test-mode', String(this.mode));
    await next();
  }
}
