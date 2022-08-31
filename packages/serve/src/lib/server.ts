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
import { ServeConfig, sslFileOptions } from '../models';
import { VulcanApplication } from './app';
import {
  EnforceHttpsOptions,
  getEnforceHttpsOptions,
  ResolverType,
} from './middleware';
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
   * Start the vulcan server. default http port is 3000, you could also change it by setting "port" under config.
   *
   * When you enabled "enforce-https" options and add "ssl" options in the config, it will run the https server too locally (default "type" = LOCAL under "enforce-https" options).
   *
   * If you don't set the "port" under "enforce-https" options, it will use the default 3001 as https port.
   */
  public async start() {
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
    this.servers = this.runServer(app);
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
   * Run server
   * for https when config has setup ssl and middleware 'enforce-https' enabled with "LOCAL" type, or keep http
   */
  private runServer(app: VulcanApplication) {
    const { enabled, options } = getEnforceHttpsOptions(
      this.config['enforce-https']
    );

    const httpPort = this.config['port'] || 3000;
    const httpServer = http.createServer(app.getHandler()).listen(httpPort);

    if (enabled && options['type'] === ResolverType.LOCAL) {
      const httpsServer = this.createHttpsServer(
        app,
        options,
        this.config['ssl']!
      );
      return { http: httpServer, https: httpsServer };
    }

    return { http: httpServer };
  }

  private createHttpsServer(
    app: VulcanApplication,
    options: EnforceHttpsOptions,
    ssl: sslFileOptions
  ) {
    // check ssl file
    if (!fs.existsSync(ssl.key) || !fs.existsSync(ssl.cert))
      throw new Error(
        'Must need key and cert file at least when open https server.'
      );

    // create https server
    const httpsPort = options['port'] || 3001;
    return https
      .createServer(
        {
          key: fs.readFileSync(ssl.key),
          cert: fs.readFileSync(ssl.cert),
          // if ca not exist, set undefined
          ca: fs.existsSync(ssl.ca) ? fs.readFileSync(ssl.ca) : undefined,
        },
        app.getHandler()
      )
      .listen(httpsPort);
  }
}
