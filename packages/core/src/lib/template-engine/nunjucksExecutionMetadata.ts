import * as nunjucks from 'nunjucks';
import { ExecuteContext, UserInfo } from './compiler';
import { KoaRequest } from '@vulcan-sql/core/models';

export const ReservedContextKeys = {
  CurrentProfileName: 'RESERVED_CURRENT_PROFILE_NAME',
};

/** A helper class to manage metadata while executing templates, e.g. parameters, profile ...etc. */
export class NunjucksExecutionMetadata {
  private profileName: string;
  private parameters: Record<string, any>;
  private userInfo?: UserInfo;
  private req?: KoaRequest;

  constructor({ parameters = {}, profileName, user, req }: ExecuteContext) {
    this.parameters = parameters;
    this.profileName = profileName;
    this.userInfo = user;
    this.req = req;
  }

  /** Load from nunjucks context */
  static load(context: nunjucks.Context) {
    return new NunjucksExecutionMetadata({
      parameters: context.lookup('context')?.params || {},
      user: context.lookup('context')?.user || {},
      req: context.lookup('context')?.req || {},
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
}
