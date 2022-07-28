import { AppConfig } from '@vulcan-sql/serve/models';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import { BuiltInMiddleware, RouteMiddlewareNext } from '../../middleware';
import { checkUsableFormat, loadUsableFormatters } from './helpers';

export type ResponseFormatOptions = {
  formats: string[];
  default: string;
};

export class ResponseFormatMiddleware extends BuiltInMiddleware {
  public readonly defaultFormat;
  public readonly supportedFormats: string[];

  constructor(config: AppConfig) {
    super('response-format', config);

    const options = (this.getOptions() as ResponseFormatOptions) || {};
    const formats = options.formats || [];

    this.supportedFormats = formats.map((format) => format.toLowerCase());
    this.defaultFormat = !options.default ? 'json' : options.default;
  }
  public async handle(context: KoaRouterContext, next: RouteMiddlewareNext) {
    // return to skip the middleware, if disabled
    if (!this.enabled) return next();

    const formatters = await loadUsableFormatters(this.config.extensions);
    // get supported and request format to use.
    const format = checkUsableFormat({
      context,
      formatters,
      supportedFormats: this.supportedFormats,
      defaultFormat: this.defaultFormat,
    });

    context.request.path = context.request.path.split('.')[0];
    // go to next to run middleware and route
    await next();
    // format the response and route handler ran.
    formatters[format].formatToResponse(context);
    return;
  }
}
