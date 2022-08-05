import { IsOptional, IsString, validateSync } from 'class-validator';
import { inject, injectable, optional } from 'inversify';
import { TYPES } from '../containers';
import { ICoreOptions } from '../models';

/** Root level options */
@injectable()
export class ProjectOptions implements Partial<ICoreOptions> {
  @IsString()
  @IsOptional()
  public readonly name?: string;

  @IsString()
  @IsOptional()
  public readonly description?: string;

  @IsString()
  @IsOptional()
  public readonly version?: string;

  constructor(
    @inject(TYPES.ProjectInputOptions)
    @optional()
    options: Partial<ICoreOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error('Invalid root options: ' + errors.join(', '));
    }
  }
}
