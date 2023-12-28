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
    bind<PersistentStore>(TYPES.PersistentStore)
      .toDynamicValue((context) => {
        const factory = context.container.get<
          interfaces.AutoNamedFactory<PersistentStore>
        >(TYPES.Factory_PersistentStore);
        const options = context.container.get<ArtifactBuilderOptions>(
          TYPES.ArtifactBuilderOptions
        );
        return factory(options.provider);
      })
      .inSingletonScope();

    // Serializer
    bind<interfaces.AutoNamedFactory<Serializer<any>>>(
      TYPES.Factory_Serializer
    ).toAutoNamedFactory<Serializer<any>>(TYPES.Extension_Serializer);
    bind<Serializer<any>>(TYPES.Serializer)
      .toDynamicValue((context) => {
        const factory = context.container.get<
          interfaces.AutoNamedFactory<Serializer<any>>
        >(TYPES.Factory_Serializer);
        const options = context.container.get<ArtifactBuilderOptions>(
          TYPES.ArtifactBuilderOptions
        );
        return factory(options.serializer);
      })
      .inSingletonScope();

    // ArtifactBuilder
    bind<ArtifactBuilder>(TYPES.ArtifactBuilder)
      .to(VulcanArtifactBuilder)
      .inSingletonScope();
  });
