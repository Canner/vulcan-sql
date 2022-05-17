import { injectable, inject } from 'inversify';
import { TYPES } from '@vulcan/core/containers';
import {
  IArtifactBuilderOptions,
  PersistentStoreType,
  SerializerType,
} from '@vulcan/core/models';

@injectable()
export class ArtifactBuilderOptions implements IArtifactBuilderOptions {
  public readonly storageType!: PersistentStoreType;
  public readonly serializerType!: SerializerType;
  public readonly path!: string;

  constructor(
    @inject(TYPES.ArtifactBuilderInputOptions)
    options: IArtifactBuilderOptions
  ) {
    Object.assign(this, options);
  }
}
