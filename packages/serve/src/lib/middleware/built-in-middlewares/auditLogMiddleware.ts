import { KoaRouterContext } from '@route/.';
import { getLogger, ILogger, LoggerOptions } from '@vulcan/core';
import { BaseRouteMiddleware, RouteMiddlewareNext } from '../middleware';
import { ServeConfig } from '@config';

export class AuditLoggingMiddleware extends BaseRouteMiddleware {
  private logger: ILogger;
  private options: LoggerOptions | undefined;
  constructor(config: ServeConfig) {
    super('audit-log', config);
    // read logger options from config.
    this.options = config.middlewares
      ? (config.middlewares[this.keyName] as LoggerOptions)
      : undefined;
    this.logger = getLogger({ scopeName: 'AUDIT', options: this.options });
  }

  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    const { path, request, params, response } = context;
    const { header, query } = request;
    this.logger.info(`request: path = ${path}`);
    this.logger.info(`request: header = ${JSON.stringify(header)}`);
    this.logger.info(`request: query = ${JSON.stringify(query)}`);
    this.logger.info(`request: params = ${JSON.stringify(params)}.`);
    await next();
    this.logger.info(`response: body = ${JSON.stringify(response.body)}`);
  }
}
