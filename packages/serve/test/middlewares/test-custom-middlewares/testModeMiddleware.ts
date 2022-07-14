import { MiddlewareConfig } from '@vulcan-sql/serve/models';
import {
  BaseRouteMiddleware,
  RouteMiddlewareNext,
} from '@vulcan-sql/serve/middleware';
import { KoaRouterContext } from '@vulcan-sql/serve/route';

export interface TestModeOptions {
  mode: boolean;
}
/* istanbul ignore file */
export class TestModeMiddleware extends BaseRouteMiddleware {
  private mode: boolean;
  constructor(config: MiddlewareConfig) {
    super('test-mode', config);
    this.mode = (this.getConfig()?.['mode'] as boolean) || false;
  }
  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    context.response.set('test-mode', String(this.mode));
    await next();
  }
}
