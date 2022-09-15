import * as nunjucks from 'nunjucks';
import { ExecuteContext } from './compiler';

export const ReservedContextKeys = {
  CurrentProfileName: 'RESERVED_CURRENT_PROFILE_NAME',
};

/** A helper class to manage metadata while executing templates, e.g. parameters, profile ...etc. */
export class NunjucksExecutionMetadata {
  private profileName: string;
  private parameters: Record<string, any>;

  constructor({ parameters = {}, profileName }: ExecuteContext) {
    this.parameters = parameters;
    this.profileName = profileName;
  }

  /** Load from nunjucks context */
  static load(context: nunjucks.Context) {
    return new NunjucksExecutionMetadata({
      parameters: context.lookup('context')?.params || {},
      profileName: context.lookup(ReservedContextKeys.CurrentProfileName)!,
    });
  }

  /** Dump to a pure object */
  public dump() {
    return {
      context: {
        params: this.parameters,
      },
      [ReservedContextKeys.CurrentProfileName]: this.profileName,
    };
  }

  public getProfileName() {
    return this.profileName;
  }
}
