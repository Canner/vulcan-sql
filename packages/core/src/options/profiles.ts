import { decorate, inject, injectable, optional } from 'inversify';
import { TYPES } from '../containers';
import { IProfilesOptions } from '../models';
import * as os from 'os';
import * as path from 'path';
import { uniq } from 'lodash';

// decorate array as injectable
decorate(injectable(), Array);

@injectable()
export class ProfilesOptions extends Array<string> implements IProfilesOptions {
  constructor(
    @inject(TYPES.ProfilesInputOptions)
    @optional()
    options: IProfilesOptions = []
  ) {
    super();

    // Default paths
    options.push('profiles.yaml');
    options.push(path.resolve(os.homedir(), '.vulcan', 'profiles.yaml'));

    uniq(options).forEach((profile) => this.push(profile));
  }
}
