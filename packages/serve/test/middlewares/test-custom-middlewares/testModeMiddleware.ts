import { BaseRouteMiddleware } from '@vulcan-sql/serve/models';
import { KoaContext, Next } from '@vulcan-sql/serve/models';

export interface TestModeOptions {
  mode: boolean;
}
/* istanbul ignore file */
export class TestModeMiddleware extends BaseRouteMiddleware {
  private mode = (this.getConfig()?.['mode'] as boolean) || false;

  public async handle(context: KoaContext, next: Next) {
    context.response.set('test-mode', String(this.mode));
    await next();
  }
}
