import { isEmpty } from 'lodash';
import { inject, multiInject } from 'inversify';
import { TYPES as CORE_TYPES, VulcanInternalExtension } from '@vulcan-sql/core';
import {
  Next,
  KoaContext,
  BuiltInMiddleware,
  BaseAuthenticator,
  UserAuthOptions,
} from '@vulcan-sql/serve/models';
import { TYPES } from '@vulcan-sql/serve/containers';

export interface AuthOptions {
  ['user-auth']?: Array<UserAuthOptions>;
}

export type AuthenticatorMap = {
  [name: string]: BaseAuthenticator;
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
    authenticators: BaseAuthenticator[]
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
    if (isEmpty(options['user-auth'])) return next();

    // authenticate each user by selected auth method in config
    for (const name of Object.keys(this.authenticators)) {
      const result = await this.authenticators[name].authenticate(
        options['user-auth'] || [],
        context
      );
      if (!result.authenticated) continue;

      // set auth user information to context
      context.state.user = result.user!;
      await next();
      return;
    }
    throw new Error('authentication failed.');
  }
}
