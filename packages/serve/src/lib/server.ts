import * as http from 'http';
import { Container, TYPES } from '../containers';
import { ServeConfig } from '../models';
import { VulcanApplication } from './app';
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

    // Load container
    await this.container.load(this.config);

    // Create application
    const app = this.container.get<VulcanApplication>(TYPES.VulcanApplication);
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
