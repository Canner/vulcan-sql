import { ResponseFormatMiddleware, RouteMiddlewareNext } from '../middleware';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import { MiddlewareConfig } from '@vulcan-sql/serve/models';
import { respondToJson } from '@vulcan-sql/serve/utils';
export class JsonResponseMiddleware extends ResponseFormatMiddleware {
  constructor(config: MiddlewareConfig) {
    super('json', config);
  }

  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    // return to skip the middleware, if disabled
    if (!this.enabled) return next();
    // return to skip the middleware, if response-format not added
    if (!this.isFormatSupported()) return next();

    if (this.isResponseFormatted(context)) return next();
    // remove ".json" to make request handler received
    context.request.url = context.request.url.split(`.${this.format}`)[0];
    // go to next middleware
    await next();

    // convert to json format for response
    respondToJson(context);

    this.setFormattedNotice(context);
  }
}
