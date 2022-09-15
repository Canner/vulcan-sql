import {
  IExecutor,
  ProfileLoader,
  QueryExecutor,
} from '@vulcan-sql/core/data-query';
import { AsyncContainerModule, interfaces } from 'inversify';
import { TYPES } from '../types';
import { ProfileReader } from '../../models/extensions';
import { IProfilesLookupOptions } from '../../models';
import { ProfilesLookupOptions } from '../../options';

export const profilesModule = (options: IProfilesLookupOptions = []) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<IProfilesLookupOptions>(
      TYPES.ProfilesLookupInputOptions
    ).toConstantValue(options);
    bind<ProfilesLookupOptions>(TYPES.ProfilesLookupOptions).to(
      ProfilesLookupOptions
    );

    // Profile
    bind<interfaces.AutoNamedFactory<ProfileReader>>(
      TYPES.Factory_ProfileReader
    ).toAutoNamedFactory(TYPES.Extension_ProfileReader);
    bind<ProfileLoader>(TYPES.ProfileLoader).to(ProfileLoader);
  });
