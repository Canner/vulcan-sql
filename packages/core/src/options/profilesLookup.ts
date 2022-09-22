import { inject, injectable, optional } from 'inversify';
import { TYPES } from '../containers';
import {
  IProfilesLookupOptions,
  ProfilesLookup,
  ProfilesLookupType,
} from '../models';
import * as os from 'os';
import * as path from 'path';
import { chain } from 'lodash';

@injectable()
export class ProfilesLookupOptions {
  private lookups: ProfilesLookup[] = [];

  constructor(
    @inject(TYPES.ProfilesLookupInputOptions)
    @optional()
    options: IProfilesLookupOptions = []
  ) {
    // Default paths
    options.push({
      type: ProfilesLookupType.LocalFile,
      options: { path: 'profiles.yaml' },
    });
    options.push({
      type: ProfilesLookupType.LocalFile,
      options: { path: path.resolve(os.homedir(), '.vulcan', 'profiles.yaml') },
    });

    chain(options)
      .map((option) => {
        if (typeof option === 'string')
          return {
            type: ProfilesLookupType.LocalFile,
            options: { path: option },
          };
        return option;
      })
      .uniqBy(JSON.stringify)
      .forEach((profile) => {
        if (!profile.type)
          throw new Error(
            `Profile config is invalid: ${JSON.stringify(
              profile
            )}, "type" is required`
          );
      })
      .forEach((profile) => this.lookups.push(profile))
      .value();
  }

  public getLookups() {
    return this.lookups;
  }
}
