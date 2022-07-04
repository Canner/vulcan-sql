import { ServeConfig } from '@vulcan/serve/config';
import {
  BaseRouteMiddleware,
  RouteMiddlewareNext,
} from '@vulcan/serve/middleware';
import { KoaRouterContext } from '@vulcan/serve/route';

export interface TestModeOptions {
  mode: boolean;
}
/* istanbul ignore file */
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
