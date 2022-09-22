import { ArtifactBuilder } from './artifactBuilder';
import { PersistentStore } from '@vulcan-sql/core/models';
import { Serializer } from '@vulcan-sql/core/models';
import { inject, injectable } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';

@injectable()
export class VulcanArtifactBuilder implements ArtifactBuilder {
  private serializer: Serializer<Record<string, any>>;
  private persistentStore: PersistentStore;
  private artifact: Record<string, any> = {};

  constructor(
    @inject(TYPES.PersistentStore)
    persistentStore: PersistentStore,
    @inject(TYPES.Serializer)
    serializer: Serializer<any>
  ) {
    this.serializer = serializer;
    this.persistentStore = persistentStore;
  }

  public async build(): Promise<void> {
    const serializedArtifact = this.serializer.serialize(this.artifact);
    await this.persistentStore.save(serializedArtifact);
  }

  public async load(): Promise<void> {
    const serializedArtifact = await this.persistentStore.load();
    this.artifact = this.serializer.deserialize(serializedArtifact);
  }

  public getArtifact<T = any>(key: string): T {
    const target = this.artifact[key];
    if (!target) throw new Error(`Artifact ${key} not found`);
    return target as T;
  }

  public addArtifact(key: string, data: any): void {
    this.artifact[key] = data;
  }
}
