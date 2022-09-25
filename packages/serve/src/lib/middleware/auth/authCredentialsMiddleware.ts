import { UserError, VulcanInternalExtension } from '@vulcan-sql/core';
import { Next, KoaContext, AuthStatus } from '@vulcan-sql/serve/models';
import { BaseAuthMiddleware } from './authMiddleware';

/** The middleware responsible for checking request auth credentials.
 *  It seek the 'auth' module name to match data through built-in and customized authenticator by BaseAuthenticator
 * */
@VulcanInternalExtension('auth')
export class AuthCredentialsMiddleware extends BaseAuthMiddleware {
  public override async onActivate() {
    await this.initialize();
  }

  public async handle(context: KoaContext, next: Next) {
    // return to stop the middleware, if disabled
    if (!this.enabled) return next();

    // The /auth/token endpoint not need contains auth credentials
    if (context.path === '/auth/token') return next();

    // pass current context to auth token for users
    for (const name of Object.keys(this.authenticators)) {
      // skip the disappeared auth type name in options
      if (!this.options[name]) continue;
      // auth token
      const result = await this.authenticators[name].authCredential(context);
      // if state is indeterminate, change to next authentication
      if (result.status === AuthStatus.INDETERMINATE) continue;
      // if state is failed, return directly
      if (result.status === AuthStatus.FAIL) {
        context.status = 401;
        context.body = {
          type: result.type,
          message: result.message || 'verify token failed',
        };
        return;
      }
      // set auth user information to context
      context.state.user = result.user!;
      await next();
      return;
    }

    throw new UserError('All types of authenticator failed.', {
      httpCode: 401,
      code: 'vulcan.unauthorized',
    });
  }
}
