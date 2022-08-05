import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import { ITemplateEngineOptions } from '@vulcan-sql/core/models';
import { IsOptional, IsString, validateSync } from 'class-validator';

@injectable()
export class TemplateEngineOptions implements ITemplateEngineOptions {
  @IsString()
  @IsOptional()
  public readonly provider!: string;

  @IsString()
  @IsOptional()
  public readonly folderPath!: string;

  @IsString()
  @IsOptional()
  public readonly codeLoader: string = 'inMemory';

  constructor(
    @inject(TYPES.TemplateEngineInputOptions)
    @optional()
    options: Partial<ITemplateEngineOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error('Invalid template engine options: ' + errors.join(', '));
    }
  }
}
