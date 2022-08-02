import { omit } from 'lodash';
import { inject } from 'inversify';
import { TYPES as CORE_TYPES } from '@vulcan-sql/core';
import { VulcanInternalExtension } from '@vulcan-sql/core';
import { BuiltInMiddleware } from '@vulcan-sql/serve/models';
import { KoaContext, Next } from '@vulcan-sql/serve/models';
import {
  Options as SslOptions,
  httpsResolver,
  xForwardedProtoResolver,
  customProtoHeaderResolver,
  azureResolver,
  forwardedResolver,
} from 'koa-sslify';
import sslify from 'koa-sslify';

// resolver type for sslify options
export enum ResolverType {
  /* use local server to run https server, suit for local usage. */
  LOCAL = 'LOCAL',
  /*
   * RFC standard header (RFC7239) to carry information in a organized way for reverse proxy used.
   *  However, currently only little reverse proxies support it. e.g: nginx supported.
   *  refer: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Forwarded
   *  refer: https://www.nginx.com/resources/wiki/start/topics/examples/forwarded/
   */
  FORWARDED = 'FORWARDED',
  /*
   * X-Forwarded-Proto header flag is one of the de-facto standard (But not RFC standard) to check and enforce https or not, almost reverse proxies supported.
   * e.g: Heroku, GKE ingress, AWS ELB, nginx.
   */
  X_FORWARDED_PROTO = 'X_FORWARDED_PROTO',
  /*
   * if use Azure Application Request Routing as reverse proxy, then it use X-ARR-SSL header flag to check and enforce https.
   * refer: https://abhimantiwari.github.io/blog/ARR/
   */
  AZURE_ARR = 'AZURE_ARR',
  /* customize the header flag to check and enforce https, when use the type, need to define an custom header flag for checking and enforcing https */
  CUSTOM = 'CUSTOM',
}

export type EnforceHttpsOptions = Omit<SslOptions, 'resolver'> & {
  type?: string;
  /* custom proto name when when type is CUSTOM */
  proto?: string;
};

// enforce https middleware
@VulcanInternalExtension('enforce-https')
export class EnforceHttpsMiddleware extends BuiltInMiddleware<EnforceHttpsOptions> {
  private koaEnforceHttps = sslify(
    this.getOptions() ? this.transformOptions(this.getOptions()!) : undefined
  );

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string
  ) {
    super(config, name);
    const rawOptions = this.getOptions() as EnforceHttpsOptions;

    const options = rawOptions ? this.transformOptions(rawOptions) : undefined;
    this.koaEnforceHttps = sslify(options);
  }

  public async handle(context: KoaContext, next: Next) {
    if (!this.enabled) return next();
    else return this.koaEnforceHttps(context, next);
  }

  private transformOptions(rawOptions: EnforceHttpsOptions) {
    // given default value if not exist.
    rawOptions.type = rawOptions.type || ResolverType.LOCAL;

    // check incorrect type
    this.checkResolverType(rawOptions.type);
    const type = rawOptions.type.toUpperCase();

    const resolverMapper = {
      [ResolverType.LOCAL.toString()]: () => httpsResolver,
      [ResolverType.FORWARDED.toString()]: () => forwardedResolver,
      [ResolverType.X_FORWARDED_PROTO.toString()]: () =>
        xForwardedProtoResolver,
      [ResolverType.AZURE_ARR.toString()]: () => azureResolver,
    };
    // if type is CUSTOM
    if (type === ResolverType.CUSTOM) {
      if (!rawOptions.proto)
        throw new Error(
          'The "CUSTOM" type need also provide "proto" in options.'
        );

      return {
        resolver: customProtoHeaderResolver(rawOptions.proto),
        ...omit(rawOptions, ['type', 'proto']),
      } as SslOptions;
    }
    // if not CUSTOM.
    return {
      resolver: resolverMapper[type](),
      ...omit(rawOptions, ['type', 'proto']),
    } as SslOptions;
  }

  private checkResolverType(type: string) {
    // check incorrect type
    if (!(type.toUpperCase() in ResolverType))
      throw new Error(
        `The type is incorrect, only support type in ${JSON.stringify(
          Object.keys(ResolverType)
        )}.`
      );
  }
}

/**
 * Get enforce https options in config
 * @param options EnforceHttpsOptions
 * @returns return enforce https options when "enforce-https" is
 */
export const getEnforceHttpsOptions = (options?: EnforceHttpsOptions) => {
  if (options) return options as EnforceHttpsOptions;
  return undefined;
};
