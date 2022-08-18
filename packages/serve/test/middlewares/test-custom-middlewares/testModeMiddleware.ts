import { BaseRouteMiddleware } from '@vulcan-sql/serve/models';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';

export interface TestModeOptions {
  mode: boolean;
}
/* istanbul ignore file */
export class TestModeMiddleware extends BaseRouteMiddleware {
  private mode = (this.getConfig()?.['mode'] as boolean) || false;

  public async handle(context: KoaRouterContext, next: KoaNext) {
    context.response.set('test-mode', String(this.mode));
    await next();
  }
}
