import { Artifact, ArtifactBuilder } from './artifactBuilder';
import { PersistentStore } from '@vulcan-sql/core/models';
import { Serializer } from '@vulcan-sql/core/models';
import { inject, injectable } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';

@injectable()
export class VulcanArtifactBuilder implements ArtifactBuilder {
  private serializer: Serializer<Artifact>;
  private persistentStore: PersistentStore;

  constructor(
    @inject(TYPES.PersistentStore)
    persistentStore: PersistentStore,
    @inject(TYPES.Serializer)
    serializer: Serializer<any>
  ) {
    this.serializer = serializer;
    this.persistentStore = persistentStore;
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
