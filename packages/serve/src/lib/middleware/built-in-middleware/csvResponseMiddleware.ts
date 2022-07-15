import { ResponseFormatMiddleware, RouteMiddlewareNext } from '../middleware';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import { MiddlewareConfig } from '@vulcan-sql/serve/models';
import { respondToCsv } from '@vulcan-sql/serve/utils';

export class CsvResponseMiddleware extends ResponseFormatMiddleware {
  constructor(config: MiddlewareConfig) {
    super('csv', config);
  }

  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    // return to skip the middleware, if disabled
    if (!this.enabled) return next();
    // return to skip the middleware, if response-format not added
    if (!this.isFormatSupported()) return next();

    // return if not end with the format of url and header "accept" not found.
    if (!this.isReceivedFormatRequest(context)) return next();

    // remove ".csv" to make request handler received
    context.request.url = context.request.url.split(`.${this.format}`)[0];
    // go to next middleware
    await next();

    // convert to csv format for response
    respondToCsv(context);

    this.setFormattedNotice(context);
  }
}
