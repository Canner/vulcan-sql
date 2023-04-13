import {
  ConfigurationError,
  getLogger,
  VulcanInternalExtension,
  TYPES as CORE_TYPES,
  ICoreOptions,
} from '@vulcan-sql/core';
import {
  AuthSourceOptions,
  AuthSourceTypes,
  BuiltInMiddleware,
  KoaContext,
  Next,
} from '@vulcan-sql/serve/models';
import { isBase64 } from 'class-validator';
import { inject } from 'inversify';
import { capitalize, chain } from 'lodash';

const logger = getLogger({ scopeName: 'SERVE' });

/** The middleware responsible for normalizing the auth source e.g: query sting / payload and move to header is header not set it.
 *  It seek the 'auth-source' module name to match data.
 * */
@VulcanInternalExtension('auth-source')
export class AuthSourceNormalizerMiddleware extends BuiltInMiddleware<AuthSourceOptions> {
  private options = (this.getOptions() as AuthSourceOptions) || {};
  private projectOptions: Partial<ICoreOptions>;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) name: string,
    @inject(CORE_TYPES.ProjectOptions) projectOptions: Partial<ICoreOptions>
  ) {
    super(config, name);
    this.projectOptions = projectOptions;
  }

  public override async onActivate() {
    if (this.enabled) {
      // normalized options
      this.options.in = this.options.in || AuthSourceTypes.QUERY;

      if (!Object.keys(AuthSourceTypes).includes(this.options.in.toUpperCase()))
        throw new ConfigurationError(
          `The "${this.options.in}" not support, only supported: ${Object.keys(
            AuthSourceTypes
          )}`
        );

      this.options.key = this.options.key || 'auth';
    }
  }

  public async handle(context: KoaContext, next: Next) {
    if (!this.enabled) return next();

    const { in: sourceIn, key } = this.options;
    let payload = undefined;
    const mapper: { [type in string]: Record<string, any> } = {
      [AuthSourceTypes.QUERY]: context.request.query as Record<string, any>,
      [AuthSourceTypes.PAYLOAD]: context.request.body as Record<string, any>,
    };

    // The endpoint not need contains auth credentials
    const docPrefix =
      this.projectOptions?.['redoc']?.url
        .replace(/\/$/, '')
        .replace(/^\//, '') || 'doc';
    const pathsWithoutAuth = [
      '/auth/token',
      '/auth/available-types',
      `/${docPrefix}`,
      `/${docPrefix}/spec`,
      `/${docPrefix}/redoc`,
    ];
    if (pathsWithoutAuth.includes(context.path)) return next();

    try {
      // normalize auth source to header
      payload = (mapper[sourceIn!.toUpperCase()] || {}) as Record<string, any>;
      if (key! in payload && isBase64(payload[key!])) {
        // decode base64
        const token = Buffer.from(payload[key!] as string, 'base64').toString();
        // parse json format to object
        const credentials = JSON.parse(token) as Record<string, any>;
        // check the "Authorization" is found ( currently only support "Authorization" )
        const found = chain(credentials)
          .keys()
          .map((credential) => capitalize(credential))
          .includes('Authorization')
          .value();
        if (found && !context.request.headers['authorization'])
          context.request.headers.authorization = credentials['Authorization'];
      }
    } catch (error) {
      logger.debug(
        'normalize auth payload source failed, reason =>',
        (error as Error).message
      );
    }
    await next();
  }
}
