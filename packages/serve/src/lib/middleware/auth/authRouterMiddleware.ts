import { isEmpty } from 'lodash';
import { Next, KoaContext, AuthUserInfo } from '@vulcan-sql/serve/models';

import * as Router from 'koa-router';
import { BaseAuthMiddleware } from './authMiddleware';
import { VulcanInternalExtension } from '@vulcan-sql/core';

/** The middleware responsible for mounting endpoint for getting token info or user profile by request.
 *  It seek the 'auth' module name to match data through built-in and customized authenticator by BaseAuthenticator
 * */
@VulcanInternalExtension('auth')
export class AuthRouterMiddleware extends BaseAuthMiddleware {
  private router = new Router();

  public override async onActivate() {
    await this.initialize();

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
    // mount get /auth/available-types endpoint
    this.mountAvailableTypesEndpoint();
  }

  /* add Getting auth token info endpoint  */
  private mountTokenEndpoint() {
    this.router.post(`/auth/token`, async (context: KoaContext) => {
      if (isEmpty(context.request.body)) {
        context.response.status = 400;
        context.body = { message: 'Please provide request parameters.' };
        return;
      }
      // Get request payload
      const type = context.request.body!['type'] as string;
      if (!type) {
        const msg = `Please provide auth "type", supported types: ${Object.keys(
          this.options
        )}.`;
        context.response.status = 400;
        context.body = { message: msg };
        return;
      }
      // type does not set up in options
      if (!this.options[type]) {
        const msg = `auth type "${type}" does not support, only supported: ${Object.keys(
          this.options
        )}.`;
        context.response.status = 400;
        context.body = { message: msg };
        return;
      }

      try {
        const result = await this.authenticators[type].getTokenInfo(context);
        context.body = result;
        return;
      } catch (err) {
        context.response.status = 400;
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
        context.response.status = 404;
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

  // get the available auth types
  private mountAvailableTypesEndpoint() {
    this.router.get(`/auth/available-types`, async (context: KoaContext) => {
      const names = Object.keys(this.authenticators);
      const availableTypes = names.filter(
        (name) => !isEmpty(this.options[name])
      );

      context.body = availableTypes;
    });
  }
}
