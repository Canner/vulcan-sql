import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import {
  ITemplateEngineOptions,
  TemplateProviderType,
} from '@vulcan-sql/core/models';
import { IsOptional, IsString, validateSync } from 'class-validator';

@injectable()
export class TemplateEngineOptions implements ITemplateEngineOptions {
  @IsString()
  public readonly provider: TemplateProviderType =
    TemplateProviderType.LocalFile;

  @IsString()
  @IsOptional()
  public readonly folderPath!: string;

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
