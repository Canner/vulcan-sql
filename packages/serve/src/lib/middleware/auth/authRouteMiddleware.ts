import { isEmpty } from 'lodash';
import { inject, multiInject } from 'inversify';
import { TYPES as CORE_TYPES, VulcanInternalExtension } from '@vulcan-sql/core';
import {
  Next,
  KoaContext,
  BuiltInMiddleware,
  BaseAuthenticator,
  AuthOptions,
  AuthUserInfo,
} from '@vulcan-sql/serve/models';
import { TYPES } from '@vulcan-sql/serve/containers';
import * as Router from 'koa-router';

type AuthenticatorMap = {
  [name: string]: BaseAuthenticator<any>;
};

/** The auth route middleware used to mount endpoint for getting token info and user profile.
 *  It seek the 'auth' module name to match data through built-in and customized authenticator by BaseAuthenticator
 * */
@VulcanInternalExtension('auth')
export class AuthRouteMiddleware extends BuiltInMiddleware<AuthOptions> {
  private options = (this.getOptions() as AuthOptions) || {};
  private authenticators: AuthenticatorMap;
  private router = new Router();

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
    const authIds = Object.keys(this.authenticators);

    // check setup auth type in options also valid in authenticators
    Object.keys(this.options).map((type) => {
      if (!authIds.includes(type))
        throw new Error(
          `The auth type "${type}" in options not supported, authenticator only supported ${authIds}.`
        );
    });

    for (const authId of authIds) {
      const authenticator = this.authenticators[authId];
      if (authenticator.activate) await authenticator.activate();
    }

    if (this.enabled && isEmpty(this.options))
      throw new Error(
        'please set at least one auth type and user credential when you enable the "auth" options.'
      );
    // setup route when enabled
    if (this.enabled) this.setRoutes();
  }

  public async handle(context: KoaContext, next: Next) {
    // return to stop the middleware, if disabled
    if (!this.enabled) return next();

    // run each auth route
    await this.router.routes()(context, next);
  }

  private setRoutes() {
    // mount post /auth/token info endpoint
    this.mountTokenEndpoint();
    // mount get /auth/user-profile endpoint
    this.mountUserProfileEndpoint();
  }

  /* add Getting auth token info endpoint  */
  private mountTokenEndpoint() {
    this.router.post(`/auth/token`, async (context: KoaContext) => {
      if (isEmpty(context.request.body)) {
        context.status = 400;
        context.body = { message: 'Please provide request parameters.' };
        return;
      }
      // Get request payload
      const type = context.request.body!['type'] as string;
      if (!type) {
        const msg = `Please provide auth "type", supported types: ${Object.keys(
          this.options
        )}.`;
        context.status = 400;
        context.body = { message: msg };
        return;
      }
      // type does not set up in options
      if (!this.options[type]) {
        const msg = `auth type "${type}" does not support, only supported: ${Object.keys(
          this.options
        )}.`;
        context.status = 400;
        context.body = { message: msg };
        return;
      }

      try {
        const result = await this.authenticators[type].getTokenInfo(context);
        context.body = result;
        return;
      } catch (err) {
        context.status = 400;
        context.body = {
          message: (err as Error).message,
        };
      }
    });
  }

  private mountUserProfileEndpoint() {
    // The route should work after the token authenticated
    this.router.get(`/auth/user-profile`, async (context: KoaContext) => {
      if (!context.state.user) {
        context.status = 404;
        context.body = {
          message: 'User profile not found.',
        };
        return;
      }

      context.body = {
        ...(context.state.user as AuthUserInfo),
      };
      return;
    });
  }
}
