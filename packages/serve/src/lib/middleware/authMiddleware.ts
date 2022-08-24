import { isEmpty } from 'lodash';
import { inject, multiInject } from 'inversify';
import { TYPES as CORE_TYPES, VulcanInternalExtension } from '@vulcan-sql/core';
import {
  Next,
  KoaContext,
  BuiltInMiddleware,
  BaseAuthenticator,
  AuthStatus,
} from '@vulcan-sql/serve/models';
import { TYPES } from '@vulcan-sql/serve/containers';

export interface AuthOptions {
  // different auth type settings
  [authType: string]: any;
}

export type AuthenticatorMap = {
  [name: string]: BaseAuthenticator<any>;
};

/** The middleware used to check request auth information.
 *  It seek the 'auth' module name to match data through built-in and customized authenticator by BaseAuthenticator
 * */
@VulcanInternalExtension('auth')
export class AuthMiddleware extends BuiltInMiddleware<AuthOptions> {
  private authenticators: AuthenticatorMap;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string,
    @multiInject(TYPES.Extension_Authenticator)
    authenticators: BaseAuthenticator<any>[]
  ) {
    super(config, name);

    this.authenticators = authenticators.reduce<AuthenticatorMap>(
      (prev, authenticator) => {
        prev[authenticator.getExtensionId()!] = authenticator;
        return prev;
      },
      {}
    );
  }

  public async handle(context: KoaContext, next: Next) {
    // return to stop the middleware, if disabled
    if (!this.enabled) return next();

    const options = (this.getOptions() as AuthOptions) || {};
    if (isEmpty(options)) return next();

    // pass current context to authenticate different users of auth type with with config
    for (const name of Object.keys(this.authenticators)) {
      // skip the disappeared auth type name in options
      if (!options[name]) continue;

      // authenticate
      const authenticator = this.authenticators[name];
      if (authenticator.activate) await authenticator.activate();
      const result = await authenticator.authenticate(context);
      // if state is incorrect, change to next authentication
      if (result.status === AuthStatus.INCORRECT) continue;
      // if state is failed, return directly
      if (result.status === AuthStatus.FAIL) {
        context.status = 401;
        context.body = {
          type: result.type,
          message: result.message || 'authentication failed',
        };
        return;
      }

      // set auth user information to context
      context.state.user = result.user!;
      await next();
      return;
    }

    throw new Error('all types of authentication failed.');
  }
}
