import { Profile, ProfileReader } from '@vulcan-sql/core/models';
import { ProfilesLookupOptions } from '@vulcan-sql/core/options';
import { TYPES } from '@vulcan-sql/core/types';
import { inject, injectable, interfaces } from 'inversify';
import { chain } from 'lodash';

@injectable()
export class ProfileLoader {
  constructor(
    @inject(TYPES.Factory_ProfileReader)
    private profileReaderFactory: interfaces.AutoNamedFactory<ProfileReader>,
    @inject(TYPES.ProfilesLookupOptions)
    private profilesLookupOptions: ProfilesLookupOptions
  ) {}

  public async getProfiles(): Promise<Map<string, Profile>> {
    const profiles = await Promise.all(
      this.profilesLookupOptions.getLookups().map(async (lookup) => {
        const reader = this.profileReaderFactory(lookup.type);
        await reader.activate();
        return reader.read(lookup.options);
      })
    );

    return chain(profiles)
      .flatten()
      .uniqBy((profile) => profile.name)
      .reduce(
        (prev, curr) => prev.set(curr.name, curr),
        new Map<string, Profile>()
      )
      .value();
  }
}
