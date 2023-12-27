import { ArtifactBuilder } from './artifactBuilder';
import { BuiltArtifact, PersistentStore } from '@vulcan-sql/api-layer/models';
import { Serializer } from '@vulcan-sql/api-layer/models';
import { inject, injectable } from 'inversify';
import { TYPES } from '@vulcan-sql/api-layer/types';
import { InternalError } from '../utils';
import { plainToInstance, instanceToPlain } from 'class-transformer';

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
    const artifactInPureObject = instanceToPlain(this.artifact);
    const serializedArtifact = this.serializer.serialize(artifactInPureObject);
    await this.persistentStore.save(serializedArtifact);
  }

  public async load(): Promise<void> {
    const serializedArtifact = await this.persistentStore.load();
    const artifactInPureObject =
      this.serializer.deserialize(serializedArtifact);
    this.artifact = plainToInstance(BuiltArtifact, artifactInPureObject);
  }

  public getArtifact<T = any>(key: string): T {
    const target = this.artifact[key];
    if (!target) throw new InternalError(`Artifact ${key} not found`);
    return target as T;
  }

  public addArtifact(key: string, data: any): void {
    this.artifact[key] = data;
  }
}
