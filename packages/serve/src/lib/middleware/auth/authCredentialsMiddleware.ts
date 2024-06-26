import {
  ICoreOptions,
  TYPES as CORE_TYPES,
  UserError,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import {
  Next,
  KoaContext,
  AuthStatus,
  BaseAuthenticator,
} from '@vulcan-sql/serve/models';
import { BaseAuthMiddleware } from './authMiddleware';
import { TYPES } from '@vulcan-sql/serve/containers';
import { inject, multiInject } from 'inversify';
import { checkIsPublicEndpoint } from './utils';

/** The middleware responsible for checking request auth credentials.
 *  It seek the 'auth' module name to match data through built-in and customized authenticator by BaseAuthenticator
 * */
@VulcanInternalExtension('auth')
export class AuthCredentialsMiddleware extends BaseAuthMiddleware {
  private projectOptions: Partial<ICoreOptions>;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string,
    @multiInject(TYPES.Extension_Authenticator)
    authenticators: BaseAuthenticator<any>[],
    @inject(CORE_TYPES.ProjectOptions) projectOptions: Partial<ICoreOptions>
  ) {
    super(config, name, authenticators);
    this.projectOptions = projectOptions;
  }

  public override async onActivate() {
    await this.initialize();
  }

  public async handle(context: KoaContext, next: Next) {
    // return to stop the middleware, if disabled
    if (!this.enabled) return next();

    // The endpoint not need contains auth credentials
    if (checkIsPublicEndpoint(this.projectOptions, context.path)) return next();

    const authorize = context.request?.headers['authorization'];
    if (!authorize) {
      throw new UserError('Please provide proper authorization information', {
        httpCode: 401,
        code: 'vulcan.unauthorized',
      });
    }

    // pass current context to auth token for users
    for (const name of Object.keys(this.authenticators)) {
      const authenticator = this.authenticators[name];
      if (
        !authorize.toLowerCase().startsWith(authenticator.getExtensionId()!)
      ) {
        continue;
      }
      // auth token
      const result = await authenticator.authCredential(context);
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
