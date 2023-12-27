import {
  getLogger,
  LoggerOptions,
  VulcanInternalExtension,
} from '@vulcan-sql/api-layer';
import * as bytes from 'bytes';
import { BuiltInMiddleware, KoaContext, Next } from '@vulcan-sql/serve/models';

@VulcanInternalExtension('access-log')
export class AccessLogMiddleware extends BuiltInMiddleware<LoggerOptions> {
  private logger = getLogger({
    scopeName: 'ACCESS_LOG',
    options: this.getOptions(),
  });

  public async handle(context: KoaContext, next: Next) {
    if (!this.enabled) return next();

    const { request: req, response: resp, params } = context;

    const reqSize = req.length ? bytes(req.length).toLowerCase() : 'none';
    const respSize = resp.length ? bytes(resp.length).toLowerCase() : 'none';
    this.logger.info(
      `--> ${req.ip} -- "${req.method} ${req.path}" -- size: ${reqSize}`
    );
    this.logger.info(` -> header: ${JSON.stringify(req.header)}`);
    this.logger.info(` -> query: ${JSON.stringify(req.query)}`);
    this.logger.info(` -> params: ${JSON.stringify(params)}`);
    await next();
    this.logger.info(`<-- status: ${resp.status} -- size: ${respSize}`);
    this.logger.info(` <- header: ${JSON.stringify(resp.header)}`);
  }
}
