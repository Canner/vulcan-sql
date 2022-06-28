import { Artifact, ArtifactBuilder } from './artifactBuilder';
import { PersistentStore } from './persistent-stores';
import { JSONSerializer, Serializer } from './serializers';

export class VulcanArtifactBuilder implements ArtifactBuilder {
  private serializer: Serializer<Artifact>;
  private persistentStore: PersistentStore;

  constructor({
    serializer,
    persistentStore,
  }: {
    serializer?: Serializer<Artifact>;
    persistentStore: PersistentStore;
  }) {
    this.serializer = serializer || new JSONSerializer();
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
