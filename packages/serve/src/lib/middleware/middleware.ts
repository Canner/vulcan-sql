import { BuiltInOptions, MiddlewareConfig } from '@vulcan-sql/serve/models';
import { KoaRouterContext } from '@vulcan-sql/serve/route';
import { Next } from 'koa';
import { isEmpty, isUndefined } from 'lodash';

export type RouteMiddlewareNext = Next;

export abstract class BaseRouteMiddleware {
  protected config: MiddlewareConfig;
  // An identifier to check the options set or not in the middlewares section of serve config
  public readonly name: string;
  constructor(name: string, config: MiddlewareConfig) {
    this.name = name;
    this.config = config;
  }
  public abstract handle(
    context: KoaRouterContext,
    next: RouteMiddlewareNext
  ): Promise<void>;

  protected getConfig() {
    if (this.config && this.config[this.name]) return this.config[this.name];
    return undefined;
  }
}

export abstract class BuiltInMiddleware extends BaseRouteMiddleware {
  // middleware is enabled or not, default is enabled beside you give "enabled: false" in config.
  protected enabled: boolean;
  constructor(name: string, config: MiddlewareConfig) {
    super(name, config);

    const value = this.getConfig()?.['enabled'] as boolean;
    this.enabled = isUndefined(value) ? true : value;
  }
  protected getOptions() {
    if (this.getConfig())
      return this.getConfig()?.['options'] as BuiltInOptions;
    return undefined;
  }
}

export type ResponseFormatOptions = string[];

export abstract class ResponseFormatMiddleware extends BuiltInMiddleware {
  protected readonly format;
  protected supportedFormats: string[];
  private formattedIdentifier = 'X-Response-Formatted';
  constructor(format: string, config: MiddlewareConfig) {
    super('response-format', config);

    this.format = format;
    let formats = this.getOptions() as ResponseFormatOptions;
    // default is json
    formats = !formats || isEmpty(format) ? ['json'] : formats;

    this.supportedFormats = formats.map((format) => format.toLowerCase());
  }
  protected isFormatSupported() {
    return this.supportedFormats.includes(this.format.toLowerCase());
  }

  protected isReceivedFormatRequest(context: KoaRouterContext) {
    const request = context.request;

    //if url is end with the format, start to formatting
    if (request.url.endsWith(`.${this.format}`)) return true;
    if (
      // if "Accept" in the header contains the format and not found the supported formats in the end of url, start to formatting
      request.accepts(this.format) &&
      !this.supportedFormats.find((format) =>
        request.url.toLowerCase().endsWith(`.${format}`)
      )
    )
      return true;
    return false;
  }

  /**
   * add the custom header key "X-Response-Formatted" to notice other response middleware
   */
  protected setFormattedNotice(context: KoaRouterContext) {
    context.response.set(this.formattedIdentifier, 'true');
  }

  /**
   * add the custom header key "X-Response-Formatted" to notice other response middleware
   */
  protected isResponseFormatted(context: KoaRouterContext) {
    if (context.response.headers[this.formattedIdentifier] === 'true')
      return true;
    return false;
  }
}
