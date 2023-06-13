import {
  ConfigurationError,
  VulcanExtensionId,
  InternalError,
} from '@vulcan-sql/core';
import {
  BaseAuthenticator,
  KoaContext,
  AuthStatus,
  AuthResult,
} from '@vulcan-sql/serve';
import { isEmpty } from 'lodash';
import axios from 'axios';
import config from '../config';

export interface CannerPATOptions {
  host: string;
  port: number;
  // default is false
  ssl: boolean;
}

@VulcanExtensionId('canner-pat')
export class CannerPATAuthenticator extends BaseAuthenticator<CannerPATOptions> {
  private options: CannerPATOptions = {} as CannerPATOptions;

  public override async onActivate() {
    this.options = this.getOptions() as CannerPATOptions;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getTokenInfo(ctx: KoaContext): Promise<any> {
    throw new InternalError(`canner-pat does not support token generate.`);
  }

  public async authCredential(context: KoaContext) {
    const incorrect = {
      status: AuthStatus.INDETERMINATE,
      type: this.getExtensionId()!,
    };
    const authorize = context.request.headers['authorization'];
    if (
      // no need to check this.options because it a external extension,
      // it must be configured correctly to be load into container and can be used in authenticate middleware
      !authorize ||
      !authorize.toLowerCase().startsWith(this.getExtensionId()!)
    )
      return incorrect;

    if (isEmpty(this.options) || !this.options.host)
      throw new ConfigurationError(
        'please provide correct connection information to Canner Enterprise, including "host".'
      );

    // validate request auth token
    const token = authorize.trim().split(' ')[1];

    try {
      return await this.validate(token);
    } catch (err) {
      return {
        status: AuthStatus.FAIL,
        type: this.getExtensionId()!,
        message: (err as Error).message,
      };
    }
  }

  private async validate(token: string) {
    const res = await this.fetchCannerUser(token);
    const cannerUser = res.data.data?.userMe;
    const { username, ...restAttrs } = cannerUser;
    return {
      status: AuthStatus.SUCCESS,
      type: this.getExtensionId()!, // method name
      user: {
        name: username,
        attr: restAttrs,
      },
    } as AuthResult;
  }

  private async fetchCannerUser(token: string) {
    const graphqlUrl = this.getCannerUrl('/web/graphql');
    try {
      return await axios.post(
        graphqlUrl,
        {
          operationName: 'UserMe',
          variables: {},
          query:
            'query UserMe{userMe {accountRole attributes createdAt email groups {id name} lastName firstName username}}',
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
    } catch (error: any) {
      const message = error.response
        ? `response status: ${
            error.response.status
          }, response data: ${JSON.stringify(error.response.data)}`
        : `remote server does not response. request ${error.toJSON()}}`;
      throw new InternalError(
        `Failed to fetch user info from canner server: ${message}`
      );
    }
  }
  private getCannerUrl(path = '/') {
    const { host, port, ssl = false } = this.options;
    if (config.isOnKubernetes)
      return `http://${process.env['WEB_SERVICE_HOST']}${path}`; // for internal usage, we don't need to specify port
    else {
      const protocol = ssl ? 'https' : 'http';
      return `${protocol}://${host}${port ? `:${port}` : ''}${path}`;
    }
  }
}
