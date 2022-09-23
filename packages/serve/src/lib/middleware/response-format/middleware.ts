import { KoaContext, Next } from '@vulcan-sql/serve/models';
import {
  BaseResponseFormatter,
  BuiltInMiddleware,
} from '@vulcan-sql/serve/models';
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
        prev[formatter.getExtensionId()!] = formatter;
        return prev;
      },
      {}
    );
    this.supportedFormats = formats.map((format) => format.toLowerCase());
    this.defaultFormat = !options.default ? 'json' : options.default;
  }

  public override async onActivate() {
    if (this.enabled) {
      if (!Object.keys(this.formatters).includes(this.defaultFormat))
        throw new Error(
          `The type "${this.defaultFormat}" in "default" not implement extension`
        );
      this.supportedFormats.map((format) => {
        if (!Object.keys(this.formatters).includes(format))
          throw new Error(
            `The type "${format}" in "formats" not implement extension`
          );
      });
    }
  }

  public async handle(context: KoaContext, next: Next) {
    // return to skip the middleware, if disabled
    if (!this.enabled) return next();
    // TODO: replace the hardcoded api with configurable prefix
    // Only handle the path for Vulcan API
    if (!context.request.path.startsWith('/api')) return next();

    // get supported and request format to use.
    const format = checkUsableFormat({
      context,
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
