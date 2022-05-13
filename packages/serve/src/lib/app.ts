import { Server } from 'http';
import Koa from 'koa';
import KoaRouter from 'koa-router';
import {
  RestfulRoute,
  BaseRoute,
  APIProviderType,
  GraphQLRoute,
} from './route-generator';

export type VulcanServer = Server;

export class VulcanApplication {
  private app: Koa;
  private restfulRouter: KoaRouter;
  private graphqlRouter: KoaRouter;
  constructor() {
    this.app = new Koa();
    this.restfulRouter = new KoaRouter();
    this.graphqlRouter = new KoaRouter();
  }

  public listen(port: number): VulcanServer {
    return this.app.listen(port);
  }

  public async setRoutes(routes: Array<BaseRoute>, type: APIProviderType) {
    const setRouteMapper = {
      [APIProviderType.RESTFUL]: (routes: Array<BaseRoute>) =>
        this.setRestfulRoutes(routes as Array<RestfulRoute>),
      [APIProviderType.GRAPHQL]: (routes: Array<BaseRoute>) =>
        this.setGraphQLRoutes(routes as Array<GraphQLRoute>),
    };
    if (!(type in setRouteMapper))
      throw new Error(`The API ${type} not provided now`);
    // Set Routes to koa router according to API type
    await setRouteMapper[type](routes);
  }
  // Setup restful routes to server
  private async setRestfulRoutes(routes: Array<RestfulRoute>) {
    await Promise.all(
      routes.map((route) => {
        // currently only provide get method
        this.restfulRouter.get(route.urlPath, route.respond.bind(route));
      })
    );

    this.app.use(this.restfulRouter.routes());
    this.app.use(this.restfulRouter.allowedMethods());
  }

  private async setGraphQLRoutes(routes: Array<GraphQLRoute>) {
    console.log(routes);
    // TODO: Still building GraphQL...
    this.app.use(this.graphqlRouter.routes());
    this.app.use(this.restfulRouter.allowedMethods());
  }
}
