import { ServeConfig } from '@config';
import { APISchema, ClassType } from '@vulcan/core';
import { Server } from 'http';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { isEmpty, uniq } from 'lodash';
import {
  AuditLoggingMiddleware,
  BaseRouteMiddleware,
  CorsMiddleware,
  RequestIdMiddleware,
  loadExtensions,
  RateLimitMiddleware,
} from './middleware';
import {
  RestfulRoute,
  BaseRoute,
  APIProviderType,
  GraphQLRoute,
  RouteGenerator,
} from './route';

export type VulcanServer = Server;

export class VulcanApplication {
  private app: Koa;
  private config: ServeConfig;
  private generator: RouteGenerator;
  private restfulRouter: KoaRouter;
  private graphqlRouter: KoaRouter;
  constructor({
    config,
    generator,
  }: {
    config: ServeConfig;
    generator: RouteGenerator;
  }) {
    this.config = config;
    this.generator = generator;
    this.app = new Koa();
    this.restfulRouter = new KoaRouter();
    this.graphqlRouter = new KoaRouter();
  }

  public async run({
    apiTypes,
    schemas,
    port,
  }: {
    apiTypes: Array<APIProviderType>;
    schemas: Array<APISchema>;
    port?: number;
  }): Promise<VulcanServer> {
    // setup middleware on app
    await this.setMiddleware();

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

    // open port
    return this.app.listen(port);
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

  private async setMiddleware() {
    // load built-in middleware
    await this.use(CorsMiddleware);
    await this.use(RateLimitMiddleware);
    await this.use(RequestIdMiddleware);
    await this.use(AuditLoggingMiddleware);

    // load extension middleware
    const extensions = await loadExtensions(this.config.extension);
    await this.use(...extensions);
  }
  /** add middleware classes for app used */
  private async use(...classes: ClassType<BaseRouteMiddleware>[]) {
    for (const cls of classes) {
      const middleware = new cls(this.config);
      this.app.use(middleware.handle.bind(middleware));
    }
  }
}
