import { isEmpty } from 'lodash';
import { inject, multiInject } from 'inversify';
import { TYPES as CORE_TYPES, VulcanInternalExtension } from '@vulcan-sql/core';
import {
  Next,
  KoaContext,
  BuiltInMiddleware,
  BaseAuthenticator,
  AuthStatus,
  AuthOptions,
} from '@vulcan-sql/serve/models';
import { TYPES } from '@vulcan-sql/serve/containers';

type AuthenticatorMap = {
  [name: string]: BaseAuthenticator<any>;
};

/** The middleware used to check request auth information.
 *  It seek the 'auth' module name to match data through built-in and customized authenticator by BaseAuthenticator
 * */
@VulcanInternalExtension('auth')
export class AuthCredentialMiddleware extends BuiltInMiddleware<AuthOptions> {
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
  public override async onActivate() {
    for (const name of Object.keys(this.authenticators)) {
      const authenticator = this.authenticators[name];
      if (authenticator.activate) await authenticator.activate();
    }

    if (this.enabled && isEmpty(this.getOptions())) {
      throw new Error(
        'please set at least one auth type and user credential when you enable the "auth" options.'
      );
    }
  }

  public async handle(context: KoaContext, next: Next) {
    // return to stop the middleware, if disabled
    if (!this.enabled) return next();

    const options = this.getOptions() as AuthOptions;

    // The /auth endpoint not need contains "Authorization" in header and auth credentials
    if (context.path === '/auth/token') return;

    // pass current context to auth token for users
    for (const name of Object.keys(this.authenticators)) {
      // skip the disappeared auth type name in options
      if (!options[name]) continue;
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

    throw new Error('all types of authenticator failed.');
  }
}
