import {
  UserError,
  ConfigurationError,
  VulcanExtensionId,
  VulcanInternalExtension,
  InternalError,
} from '@vulcan-sql/core';
import {
  BaseAuthenticator,
  KoaContext,
  AuthStatus,
  AuthResult,
  AuthType,
} from '@vulcan-sql/serve/models';
import { isEmpty } from 'lodash';
import * as axios from 'axios';

export interface CannerPATOptions {
  host: string;
  port: number;
  // default is false
  ssl: boolean;
}

@VulcanInternalExtension('auth')
@VulcanExtensionId(AuthType.CannerPAT)
export class CannerPATAuthenticator extends BaseAuthenticator<CannerPATOptions> {
  private options: CannerPATOptions = {} as CannerPATOptions;

  public override async onActivate() {
    this.options = this.getOptions() as CannerPATOptions;
    // const { host, port } = this.options;
    // if (this.options && (!host || !port))
    //   throw new ConfigurationError('please provide canner "host" and "port".');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getTokenInfo(ctx: KoaContext): Promise<any> {
    throw new InternalError(
      `${AuthType.CannerPAT} does not support token generate.`
    );
  }

  public async authCredential(context: KoaContext) {
    const incorrect = {
      status: AuthStatus.INDETERMINATE,
      type: this.getExtensionId()!,
    };
    const authorize = context.request.headers['authorization'];
    if (
      !authorize ||
      !authorize.toLowerCase().startsWith(this.getExtensionId()!)
    )
      return incorrect;

    if (isEmpty(this.options) || !this.options.host || !this.options.port)
      throw new ConfigurationError(
        'please provide correct connection information to Canner Enterprise, including "host" and "port".'
      );

    // validate request auth token
    const token = authorize.trim().split(' ')[1];

    try {
      return await this.validate(token);
    } catch (err) {
      // if not found matched user credential, add WWW-Authenticate and return failed
      context.set('WWW-Authenticate', this.getExtensionId()!);
      return {
        status: AuthStatus.FAIL,
        type: this.getExtensionId()!,
        message: (err as Error).message,
      };
    }
  }

  private async validate(token: string) {
    const res = await this.fetchCannerUser(token);
    if (res.status == 401) throw new UserError('invalid token');
    if (!res.data.data?.userMe) {
      throw new InternalError('Can not retrieve user info from canner server');
    }
    const cannerUser = res.data.data?.userMe;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { username, ...restAttrs } = cannerUser;
    return {
      status: AuthStatus.SUCCESS,
      type: this.getExtensionId()!, // method name
      user: {
        name: cannerUser.username,
        attr: restAttrs,
      },
    } as AuthResult;
  }

  private async fetchCannerUser(token: string) {
    const graphqlUrl = this.getCannerUrl('/web/graphql');
    try {
      return await axios.default.post(
        graphqlUrl,
        {
          operationName: 'UserMe',
          variables: {},
          query:
            'query UserMe{\n  userMe {\n    accountRole\n    attributes\n    createdAt\n    email\n    groups {\n      id\n      name\n    }\n    lastName\n    firstName\n    username\n  }\n}',
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
    } catch (error) {
      throw new InternalError(
        `Failed to fetch user info from canner server: ${error}`
      );
    }
  }
  private getCannerUrl = (path = '/') => {
    const { host, port, ssl = false } = this.options;
    if (process.env['IS_IN_K8S'])
      return `http://${process.env['WEB_SERVICE_HOST']}${path}`; // for internal usage, we don't need to specify port
    else {
      const protocol = ssl ? 'https' : 'http';
      return `${protocol}://${host}:${port}${path}`;
    }
  };
}
