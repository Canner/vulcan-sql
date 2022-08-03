import {
  getLogger,
  LoggerOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import { BuiltInMiddleware } from '@vulcan-sql/serve/models';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';

@VulcanInternalExtension('audit-log')
export class AuditLoggingMiddleware extends BuiltInMiddleware<LoggerOptions> {
  private logger = getLogger({
    scopeName: 'AUDIT',
    options: this.getOptions(),
  });

  public async handle(context: KoaRouterContext, next: KoaNext) {
    if (!this.enabled) return next();

    const { path, request, params, response } = context;
    const { header, query } = request;
    /**
     * TODO: The response body of our API server might be huge.
     * We can let users to set what data they want to record in config in the future.
     */
    this.logger.info(`request: path = ${path}`);
    this.logger.info(`request: header = ${JSON.stringify(header)}`);
    this.logger.info(`request: query = ${JSON.stringify(query)}`);
    this.logger.info(`request: params = ${JSON.stringify(params)}.`);
    await next();
    this.logger.info(`response: body = ${JSON.stringify(response.body)}`);
  }
}
