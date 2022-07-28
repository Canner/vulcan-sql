import { AppConfig } from '@vulcan-sql/serve/models';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';
import { BuiltInMiddleware } from '../../middleware';
import { checkUsableFormat } from './helpers';
import { importExtensions, loadComponents } from '@vulcan-sql/serve/loader';
import {
  BaseResponseFormatter,
  BuiltInFormatters,
} from '@vulcan-sql/serve/response-formatter';

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
  public async handle(context: KoaRouterContext, next: KoaNext) {
    // return to skip the middleware, if disabled
    if (!this.enabled) return next();

    const classesOfExtension = await importExtensions(
      'response-formatter',
      this.config.extensions
    );
    const formatters = await loadComponents<BaseResponseFormatter>([
      ...BuiltInFormatters,
      ...classesOfExtension,
    ]);

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
