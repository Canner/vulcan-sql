import {
  BaseResponseFormatter,
  BuiltInMiddleware,
} from '@vulcan-sql/serve/models';
import { KoaRouterContext, KoaNext } from '@vulcan-sql/serve/route';
import { checkUsableFormat, ResponseFormatterMap } from './helpers';
import { VulcanInternalExtension } from '@vulcan-sql/core';
import { TYPES as CORE_TYPES } from '@vulcan-sql/core';
import { inject, multiInject } from 'inversify';
import { TYPES } from '@vulcan-sql/serve/containers';

export type ResponseFormatOptions = {
  formats: string[];
  default: string;
};

@VulcanInternalExtension('response-format')
export class ResponseFormatMiddleware extends BuiltInMiddleware<ResponseFormatOptions> {
  public readonly defaultFormat;
  public readonly supportedFormats: string[];
  private formatters: ResponseFormatterMap;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string,
    @multiInject(TYPES.Extension_Formatter) formatters: BaseResponseFormatter[]
  ) {
    super(config, name);

    const options = (this.getOptions() as ResponseFormatOptions) || {};
    const formats = options.formats || [];
    this.formatters = formatters.reduce<ResponseFormatterMap>(
      (prev, formatter) => {
        prev[formatter.name] = formatter;
        return prev;
      },
      {}
    );

    this.supportedFormats = formats.map((format) => format.toLowerCase());
    this.defaultFormat = !options.default ? 'json' : options.default;
  }

  public async handle(context: KoaRouterContext, next: KoaNext) {
    // return to skip the middleware, if disabled
    if (!this.enabled) return next();

    // get supported and request format to use.
    const format = checkUsableFormat({
      context,
      formatters: this.formatters,
      supportedFormats: this.supportedFormats,
      defaultFormat: this.defaultFormat,
    });

    context.request.path = context.request.path.split('.')[0];
    // go to next to run middleware and route
    await next();
    // format the response and route handler ran.
    this.formatters[format].formatToResponse(context);
    return;
  }
}
