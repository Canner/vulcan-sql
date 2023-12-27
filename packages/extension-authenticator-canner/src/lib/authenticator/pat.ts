import {
  ConfigurationError,
  VulcanExtensionId,
  InternalError,
} from '@vulcan-sql/api-layer';
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
    if (isEmpty(this.options) || !this.options.host)
      throw new ConfigurationError(
        'please provide correct connection information to Canner Enterprise, including "host".'
      );
    const authorize = <string>context.request.headers['authorization'];
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
    const graphqlUrl = this.getCannerUrl('/graphql');
    try {
      return await axios.post(
        graphqlUrl,
        {
          operationName: 'UserMe',
          variables: {},
          query:
            'query UserMe{userMe {id accountRole attributes createdAt email groups {id name} lastName firstName username}}',
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
    // the web endpoint is different between connecting from internal or external
    if (config.isOnKubernetes) {
      // the vulcan-sql service and web service is in the same cluster and will not pass the nginx proxy
      return `${process.env['WEB_ENDPOINT']}${path}`;
    } else {
      const protocol = ssl ? 'https' : 'http';
      // canner nginx proxy will redirect all request to web service when path starts with /web
      const pathPrefix = '/web';
      const endpoint = `${protocol}://${host}${port ? `:${port}` : ''}`;
      return `${endpoint}${pathPrefix}${path}`;
    }
  }
}
