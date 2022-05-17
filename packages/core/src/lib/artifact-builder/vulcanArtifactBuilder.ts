import { Artifact, ArtifactBuilder } from './artifactBuilder';
import { PersistentStore } from './persistent-stores';
import { Serializer } from './serializers';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '@vulcan/core/containers';
import { IArtifactBuilderOptions } from '../../models/artifactBuilderOptions';

@injectable()
export class VulcanArtifactBuilder implements ArtifactBuilder {
  private serializer: Serializer<Artifact>;
  private persistentStore: PersistentStore;

  constructor(
    @inject(TYPES.Factory_PersistentStore)
    persistentStoreFactory: interfaces.AutoNamedFactory<PersistentStore>,
    @inject(TYPES.Factory_Serializer)
    serializerFactory: interfaces.AutoNamedFactory<Serializer<any>>,
    @inject(TYPES.ArtifactBuilderOptions) options: IArtifactBuilderOptions
  ) {
    this.serializer = serializerFactory(options.serializerType);
    this.persistentStore = persistentStoreFactory(options.storageType);
  }

  public async build(artifact: Artifact): Promise<void> {
    const serializedArtifact = this.serializer.serialize(artifact);
    await this.persistentStore.save(serializedArtifact);
  }

  public async load(): Promise<Artifact> {
    const serializedArtifact = await this.persistentStore.load();
    return this.serializer.deserialize(serializedArtifact);
  }
}
