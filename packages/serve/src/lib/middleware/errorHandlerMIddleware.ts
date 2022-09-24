import { BuiltInMiddleware, KoaContext, Next } from '@vulcan-sql/serve/models';
import {
  getLogger,
  UserError,
  VulcanError,
  VulcanInternalExtension,
  asyncReqIdStorage,
} from '@vulcan-sql/core';

@VulcanInternalExtension('error-handler')
export class ErrorHandlerMiddleware extends BuiltInMiddleware {
  private logger = getLogger({ scopeName: 'SERVE' });

  public async handle(context: KoaContext, next: Next) {
    if (!this.enabled) return next();
    try {
      await next();
    } catch (e) {
      this.logger.warn(e);
      const { requestId } = asyncReqIdStorage.getStore() || {};
      // Set status code
      if (e instanceof VulcanError) {
        context.response.status = e.httpCode || 500;
      }
      // Only set error message when this is an user error
      if (e instanceof UserError) {
        context.response.body = {
          code: e.code,
          message: e.message,
          requestId,
        };
      } else {
        context.response.body = {
          message: 'An internal error occurred',
          requestId,
        };
      }
    }
  }
}
