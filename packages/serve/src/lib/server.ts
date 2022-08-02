import { isEmpty } from 'lodash';
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
  private servers?: {
    http: http.Server;
    https?: https.Server;
  };
  constructor(config: ServeConfig) {
    this.config = config;
    this.container = new Container();
  }
  /**
   * Start the vulcan server
   * @param port the http port for server start, default is 3000
   * @param httpsPort the https port for https server start when you set "type" = LOCAL in "enforce-https" middleware and provide ssl file, default port is 3001
   */
  public async start(port = 3000, httpsPort = 3001) {
    if (!isEmpty(this.servers))
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
    this.servers = this.runServer(app, port, httpsPort);
    return this.servers;
  }
  public async close() {
    if (this.servers) {
      if (this.servers['http']) this.servers['http'].close();
      if (this.servers['https']) this.servers['https'].close();
      this.servers = undefined;
    }
    this.container.unload();
  }

  /**
   * Run server for https when config has setup ssl and middleware 'enforce-https' enabled with LOCAL type, or keep http
   */
  private runServer(app: VulcanApplication, port: number, httpsPort: number) {
    const options = getEnforceHttpsOptions(this.config['enforce-https']);
    if (options && this.config.ssl) {
      const options = {
        key: fs.readFileSync(this.config.ssl.keyFile),
        cert: fs.readFileSync(this.config.ssl.certFile),
      };

      const httpServer = http.createServer(app.getHandler()).listen(port);
      const httpsServer = https
        .createServer(options, app.getHandler())
        .listen(httpsPort);
      return {
        http: httpServer,
        https: httpsServer,
      };
    }
    return {
      http: http.createServer(app.getHandler()).listen(port),
    };
  }
}
