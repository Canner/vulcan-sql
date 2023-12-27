import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/api-layer/types';
import {
  ArtifactBuilderProviderType,
  ArtifactBuilderSerializerType,
  IArtifactBuilderOptions,
} from '@vulcan-sql/api-layer/models';
import { IsString, validateSync, IsOptional } from 'class-validator';
import { ConfigurationError } from '../lib/utils/errors';

@injectable()
export class ArtifactBuilderOptions implements IArtifactBuilderOptions {
  @IsString()
  public readonly provider: string = ArtifactBuilderProviderType.LocalFile;

  @IsString()
  public readonly serializer: string = ArtifactBuilderSerializerType.JSON;

  @IsString()
  @IsOptional()
  public readonly filePath!: string;

  constructor(
    @inject(TYPES.ArtifactBuilderInputOptions)
    @optional()
    options: Partial<IArtifactBuilderOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ConfigurationError(
        'Invalid artifact builder options: ' + errors.join(', ')
      );
    }
  }
}
