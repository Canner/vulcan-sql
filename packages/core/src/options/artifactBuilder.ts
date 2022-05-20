import { injectable, inject } from 'inversify';
import { TYPES } from '@vulcan/core/containers';
import {
  IArtifactBuilderOptions,
  PersistentStoreType,
  SerializerType,
} from '@vulcan/core/models';

@injectable()
export class ArtifactBuilderOptions implements IArtifactBuilderOptions {
  public readonly provider!: PersistentStoreType;
  public readonly serializer!: SerializerType;
  public readonly filePath!: string;

  constructor(
    @inject(TYPES.ArtifactBuilderInputOptions)
    options: IArtifactBuilderOptions
  ) {
    Object.assign(this, options);
  }
}
