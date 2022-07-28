import { APISchema } from '@vulcan-sql/core';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { isEmpty, uniq } from 'lodash';
import { BaseRouteMiddleware, BuiltInRouteMiddlewares } from './middleware';
import {
  RestfulRoute,
  BaseRoute,
  APIProviderType,
  GraphQLRoute,
  RouteGenerator,
} from './route';
import { AppConfig } from '../models';
import { importExtensions, loadComponents } from './loader';

export class VulcanApplication {
  private app: Koa;
  private config: AppConfig;
  private restfulRouter: KoaRouter;
  private graphqlRouter: KoaRouter;
  private generator: RouteGenerator;
  constructor(config: AppConfig, generator: RouteGenerator) {
    this.config = config;
    this.generator = generator;
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
    // import extension middleware classes
    const classesOfExtension = await importExtensions(
      'middlewares',
      this.config.extensions
    );
    const map = await loadComponents<BaseRouteMiddleware>(
      [...BuiltInRouteMiddlewares, ...classesOfExtension],
      this.config
    );
    for (const name of Object.keys(map)) {
      const middleware = map[name];
      this.app.use(middleware.handle.bind(middleware));
    }
  }
}
