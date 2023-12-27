import * as nunjucks from 'nunjucks';
import { ExecuteContext, UserInfo } from './compiler';
import { IncomingHttpHeaders, KoaRequest } from '@vulcan-sql/api-layer/models';

export const ReservedContextKeys = {
  CurrentProfileName: 'RESERVED_CURRENT_PROFILE_NAME',
};

/** A helper class to manage metadata while executing templates, e.g. parameters, profile ...etc. */
export class NunjucksExecutionMetadata {
  private profileName: string;
  private parameters: Record<string, any>;
  private userInfo?: UserInfo;
  private req?: KoaRequest;
  private headers?: IncomingHttpHeaders;

  constructor({
    parameters = {},
    profileName,
    user,
    req,
    headers,
  }: ExecuteContext) {
    this.parameters = parameters;
    this.profileName = profileName;
    this.userInfo = user;
    this.req = req;
    this.headers = headers;
  }

  /** Load from nunjucks context */
  static load(context: nunjucks.Context) {
    return new NunjucksExecutionMetadata({
      parameters: context.lookup('context')?.params || {},
      user: context.lookup('context')?.user || {},
      req: context.lookup('context')?.req || {},
      headers: context.lookup('context')?.headers || {},
      profileName: context.lookup(ReservedContextKeys.CurrentProfileName)!,
    });
  }

  /** Dump to a pure object */
  public dump() {
    return {
      context: {
        params: this.parameters,
        user: this.userInfo,
        req: this.req,
        profile: this.profileName,
        headers: this.headers,
      },
      [ReservedContextKeys.CurrentProfileName]: this.profileName,
    };
  }

  public getProfileName() {
    return this.profileName;
  }

  public getUserInfo() {
    return this.userInfo;
  }

  public getRequest() {
    return this.req;
  }

  public getHeaders() {
    return this.headers;
  }
}
