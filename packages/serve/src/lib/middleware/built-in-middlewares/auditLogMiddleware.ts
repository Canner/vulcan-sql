import { KoaRouterContext } from '@route/.';
import { getLogger, ILogger, LoggerOptions } from '@vulcan/core';
import { BuiltInMiddleware, RouteMiddlewareNext } from '../middleware';
import { ServeConfig } from '@config';

export class AuditLoggingMiddleware extends BuiltInMiddleware {
  private logger: ILogger;
  constructor(config: ServeConfig) {
    super('audit-log', config);

    // read logger options from config, if is undefined will set default value
    const options = this.getOptions() as LoggerOptions;
    this.logger = getLogger({ scopeName: 'AUDIT', options });
  }

  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    if (!this.enabled) await next();
    else {
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
}
