import { APISchema } from '@vulcan-sql/core';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { isEmpty, uniq } from 'lodash';
import {
  RestfulRoute,
  BaseRoute,
  APIProviderType,
  GraphQLRoute,
  RouteGenerator,
} from './route';
import { inject, injectable, multiInject, optional } from 'inversify';
import { TYPES } from '../containers';
import { BaseRouteMiddleware } from '../models';

@injectable()
export class VulcanApplication {
  private app: Koa;
  private restfulRouter: KoaRouter;
  private graphqlRouter: KoaRouter;
  private generator: RouteGenerator;
  private routeMiddlewares: BaseRouteMiddleware[];

  constructor(
    @inject(TYPES.RouteGenerator) generator: RouteGenerator,
    @multiInject(TYPES.Extension_RouteMiddleware)
    @optional()
    routeMiddlewares: BaseRouteMiddleware[] = []
  ) {
    this.generator = generator;
    this.routeMiddlewares = routeMiddlewares;
    this.app = new Koa();
    this.restfulRouter = new KoaRouter();
    this.graphqlRouter = new KoaRouter();
  }

  /**
   * Get request handler callback function, used in createServer function in http / https.
   */
  public getHandler() {
    return this.app.callback();
  }
  public async buildRoutes(
    schemas: Array<APISchema>,
    apiTypes: Array<APIProviderType>
  ) {
    // setup API route according to api types and api schemas
    const routeMapper = {
      [APIProviderType.RESTFUL]: (routes: Array<BaseRoute>) =>
        this.setRestful(routes as Array<RestfulRoute>),
      [APIProviderType.GRAPHQL]: (routes: Array<BaseRoute>) =>
        this.setGraphQL(routes as Array<GraphQLRoute>),
    };

    // check existed at least one type
    const types = uniq(apiTypes);
    if (isEmpty(types)) throw new Error(`The API type must provided.`);

    for (const type of types) {
      const routes = await this.generator.multiGenerate(schemas, type);
      await routeMapper[type](routes);
    }
  }

  // Setup restful routes to server
  private async setRestful(routes: Array<RestfulRoute>) {
    await Promise.all(
      routes.map((route) => {
        // currently only provide get method
        this.restfulRouter.get(route.urlPath, route.respond.bind(route));
      })
    );

    this.app.use(this.restfulRouter.routes());
    this.app.use(this.restfulRouter.allowedMethods());
  }

  private async setGraphQL(routes: Array<GraphQLRoute>) {
    console.log(routes);
    // TODO: Still building GraphQL...
    this.app.use(this.graphqlRouter.routes());
    this.app.use(this.restfulRouter.allowedMethods());
  }

  /** load built-in and extensions middleware classes for app used */
  public async useMiddleware() {
    for (const middleware of this.routeMiddlewares) {
      if (middleware.activate) await middleware.activate();
      this.app.use(middleware.handle.bind(middleware));
    }
  }
}
