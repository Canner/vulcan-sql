import { AsyncContainerModule, interfaces } from 'inversify';
import { TYPES } from '../types';
import {
  DataSource,
  EXTENSION_IDENTIFIER_METADATA_KEY,
  EXTENSION_TYPE_METADATA_KEY,
} from '../../models/extensions';
import { Profile } from '../../models/profile';
import { ClassType } from '../../lib/utils/module';
import { ConfigurationError } from '@vulcan-sql/core/utils';
import { ICacheLayerOptions, cacheProfileName } from '@vulcan-sql/core/models';
import 'reflect-metadata';

export const dataSourceModule = (
  profiles: Map<string, Profile>,
  options?: ICacheLayerOptions
) =>
  new AsyncContainerModule(async (bind) => {
    // Set the cache layer profile if user set cache loader in options
    // The cache layer is a special data source which is used to cache the data from other data sources.
    // We don't check the schemas has cache config or not in artifact, because it need to load artifact first to get.
    // However if the container loading data source module when artifact not generated, it will throw error.
    if (options?.loader) {
      profiles.set(cacheProfileName, {
        name: cacheProfileName,
        type: options.loader.toLocaleLowerCase(),
        // allow '*' to make every user request could use the cache-layer data source.
        allow: '*',
      } as Profile);
    }

    // Data source
    // Relation: Executor --- Builder --- Data Source --- Profiles

    // This factory return the data source which has the target profile name
    // For example: we have three profiles p1, p2, and p3. Two data source ds1 and d2s.
    // ds1 has two profiles p1 and p2, ds2 has only one profile p3.
    // factory('p1') -> ds1 / factory('p2') -> ds2 / factory('p3') -> ds2
    bind<interfaces.SimpleFactory<DataSource>>(
      TYPES.Factory_DataSource
    ).toFactory((context) => (profileName: string) => {
      const profile = profiles.get(profileName);
      if (!profile)
        throw new ConfigurationError(`Profile ${profileName} not found`);
      return context.container.getNamed(
        TYPES.Extension_DataSource,
        profile.type
      );
    });

    // Bind profiles to their data source
    for (const profile of profiles.values()) {
      bind<Profile>(TYPES.Profile)
        .toConstantValue(profile)
        .when((request) => {
          // Using index 0 because constraints are applied to one binding at a time (see Planner class)
          // See https://github.com/inversify/InversifyJS/blob/master/src/syntax/constraint_helpers.ts#L32
          const constructor = request.parentRequest?.bindings[0]
            .implementationType as ClassType<DataSource>;
          const parentType = Reflect.getMetadata(
            EXTENSION_TYPE_METADATA_KEY,
            constructor
          );
          // Always fulfill the request while the injector isn't a data source
          if (parentType !== TYPES.Extension_DataSource) return true;

          const dataSourceId = Reflect.getMetadata(
            EXTENSION_IDENTIFIER_METADATA_KEY,
            constructor
          );
          return dataSourceId === profile.type;
        });
    }
  });
