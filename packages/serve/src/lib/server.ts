import { omit } from 'lodash';
import * as http from 'http';
import { Container, TYPES } from '../containers';
import { ServeConfig } from '../models';
import { VulcanApplication } from './app';
import { RouteGenerator } from './route';
import { APISchema } from '@vulcan-sql/core';

export class VulcanServer {
  private config: ServeConfig;
  private container: Container;
  private server?: http.Server;
  private schemas: Array<APISchema>;
  constructor(config: ServeConfig, schemas: Array<APISchema>) {
    this.config = config;
    this.schemas = schemas;
    this.container = new Container();
  }
  public async start(port = 3000) {
    if (this.server)
      throw new Error('Server has created, please close it first.');

    // Get generator
    await this.container.load(this.config);
    const generator = this.container.get<RouteGenerator>(TYPES.RouteGenerator);

    // Create application
    const app = new VulcanApplication(omit(this.config, 'template'), generator);
    await app.useMiddleware();
    await app.buildRoutes(this.schemas, this.config.types);
    // Run server
    this.server = http.createServer(app.getHandler()).listen(port);
  }
  public async close() {
    if (this.server) this.server.close();
    this.container.unload();
  }
}
