import { AsyncContainerModule, ContainerModule, interfaces } from 'inversify';
import {
  PersistentStore,
  LocalFilePersistentStore,
  Serializer,
  JSONSerializer,
  ArtifactBuilder,
  VulcanArtifactBuilder,
} from '@vulcan-sql/core/artifact-builder';
import { TYPES } from '../types';
import {
  SerializerType,
  PersistentStoreType,
  IArtifactBuilderOptions,
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
    bind<PersistentStore>(TYPES.PersistentStore)
      .to(LocalFilePersistentStore)
      .inSingletonScope()
      .whenTargetNamed(PersistentStoreType.LocalFile);

    bind<interfaces.AutoNamedFactory<PersistentStore>>(
      TYPES.Factory_PersistentStore
    ).toAutoNamedFactory<PersistentStore>(TYPES.PersistentStore);

    // Serializer
    bind<Serializer<any>>(TYPES.Serializer)
      .to(JSONSerializer)
      .inSingletonScope()
      .whenTargetNamed(SerializerType.JSON);

    bind<interfaces.AutoNamedFactory<Serializer<any>>>(
      TYPES.Factory_Serializer
    ).toAutoNamedFactory<Serializer<any>>(TYPES.Serializer);

    // ArtifactBuilder
    bind<ArtifactBuilder>(TYPES.ArtifactBuilder)
      .to(VulcanArtifactBuilder)
      .inSingletonScope();
  });
