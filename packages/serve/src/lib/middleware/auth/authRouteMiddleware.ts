import { isEmpty } from 'lodash';
import { inject, multiInject } from 'inversify';
import { TYPES as CORE_TYPES, VulcanInternalExtension } from '@vulcan-sql/core';
import {
  Next,
  KoaContext,
  BuiltInMiddleware,
  BaseAuthenticator,
  AuthOptions,
} from '@vulcan-sql/serve/models';
import { TYPES } from '@vulcan-sql/serve/containers';
import * as Router from 'koa-router';

type AuthenticatorMap = {
  [name: string]: BaseAuthenticator<any>;
};

/** The auth route middleware used to auth identity.
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
      if (isEmpty(this.options))
        throw new Error(
          'please set at least one auth type and user credential when you enable the "auth" options.'
        );
    // setup route when enabled
    if (this.enabled) this.setAuthRoute();
  }

  public async handle(context: KoaContext, next: Next) {
    // return to stop the middleware, if disabled
    if (!this.enabled) return next();

    // run each auth route
    await this.router.routes()(context, next);
  }

  private setAuthRoute() {
    this.router.get(`/auth/token`, async (context: KoaContext, next) => {
      await next();
      // not found type query string
      if (!('type' in context.request.query)) {
        context.status = 400;
        context.body = {
          message: `Please indicate auth "type", supported auth types: ${Object.keys(
            this.options
          )}.`,
        };

        return;
      }
      // type does not set up in options
      const type = context.request.query['type'] as string;
      if (!this.options[type]) {
        context.status = 400;
        context.body = {
          message: `auth type "${type}" does not support, only supported: ${Object.keys(
            this.options
          )}.`,
        };
        return;
      }
      // type does not support
      try {
        const result = await this.authenticators[type].getTokenInfo(context);
        context.body = result;
      } catch (err) {
        context.status = 400;
        context.body = {
          message: (err as Error).message,
        };
      }
    });
  }
}
