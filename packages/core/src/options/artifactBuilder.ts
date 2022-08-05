import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import { IArtifactBuilderOptions } from '@vulcan-sql/core/models';
import { IsString, validateSync, IsOptional } from 'class-validator';

@injectable()
export class ArtifactBuilderOptions implements IArtifactBuilderOptions {
  @IsString()
  public readonly provider: string = 'LocalFile';

  @IsString()
  public readonly serializer: string = 'JSON';

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
      throw new Error('Invalid artifact builder options: ' + errors.join(', '));
    }
  }
}
