import { AsyncContainerModule, interfaces } from 'inversify';
import {
  ArtifactBuilder,
  VulcanArtifactBuilder,
} from '@vulcan-sql/core/artifact-builder';
import { TYPES } from '../types';
import {
  IArtifactBuilderOptions,
  PersistentStore,
  Serializer,
} from '@vulcan-sql/core/models';
import { ArtifactBuilderOptions } from '../../options';

export const artifactBuilderModule = (options: IArtifactBuilderOptions) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<IArtifactBuilderOptions>(
      TYPES.ArtifactBuilderInputOptions
    ).toConstantValue(options);
    bind<IArtifactBuilderOptions>(TYPES.ArtifactBuilderOptions)
      .to(ArtifactBuilderOptions)
      .inSingletonScope();

    // PersistentStore
    bind<interfaces.AutoNamedFactory<PersistentStore>>(
      TYPES.Factory_PersistentStore
    ).toAutoNamedFactory<PersistentStore>(TYPES.Extension_PersistentStore);

    // Serializer
    bind<interfaces.AutoNamedFactory<Serializer<any>>>(
      TYPES.Factory_Serializer
    ).toAutoNamedFactory<Serializer<any>>(TYPES.Extension_Serializer);

    // ArtifactBuilder
    bind<ArtifactBuilder>(TYPES.ArtifactBuilder)
      .to(VulcanArtifactBuilder)
      .inSingletonScope();
  });
