import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import {
  VulcanArtifactBuilder,
  TYPES as CORE_TYPES,
  CodeLoader,
} from '@vulcan-sql/core';
import { Container, TYPES } from '../containers';
import { ServeConfig } from '../models';
import { VulcanApplication } from './app';
import { getEnforceHttpsOptions } from './middleware';
export class VulcanServer {
  private config: ServeConfig;
  private container: Container;
  private server?: http.Server;

  constructor(config: ServeConfig) {
    this.config = config;
    this.container = new Container();
  }

  public async start(port = 3000) {
    if (this.server)
      throw new Error('Server has created, please close it first.');

    // Load container
    await this.container.load(this.config);

    const artifactBuilder = this.container.get<VulcanArtifactBuilder>(
      CORE_TYPES.ArtifactBuilder
    );

    // Obtain schema and template
    const { schemas, templates } = await artifactBuilder.load();

    // Initialized template engine
    const codeLoader = this.container.get<CodeLoader>(
      CORE_TYPES.CompilerLoader
    );
    for (const templateName in templates) {
      codeLoader.setSource(templateName, templates[templateName]);
    }

    // Create application
    const app = this.container.get<VulcanApplication>(TYPES.VulcanApplication);
    await app.useMiddleware();
    await app.buildRoutes(schemas, this.config['types']);
    // Run server
    this.server = this.runServer(app, port);
    return this.server;
  }

  public runServer(app: VulcanApplication, port: number) {
    const options = getEnforceHttpsOptions(this.config['enforce-https']);
    if (options && this.config.ssl) {
      const options = {
        key: fs.readFileSync(this.config.ssl.keyFile),
        cert: fs.readFileSync(this.config.ssl.certFile),
      };
      return https.createServer(options, app.getHandler()).listen(port);
    }
    return http.createServer(app.getHandler()).listen(port);
  }

  public async close() {
    if (this.server) this.server.close();
    this.container.unload();
  }
}
