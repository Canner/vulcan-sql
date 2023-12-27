import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/api-layer/types';
import { ITemplateEngineOptions } from '@vulcan-sql/api-layer/models';
import { IsOptional, IsString, validateSync } from 'class-validator';
import { ConfigurationError } from '../lib/utils/errors';

@injectable()
export class TemplateEngineOptions implements ITemplateEngineOptions {
  @IsString()
  @IsOptional()
  public readonly provider?: string;

  @IsString()
  @IsOptional()
  public readonly folderPath!: string;

  @IsString()
  @IsOptional()
  public readonly codeLoader: string = 'InMemory';

  constructor(
    @inject(TYPES.TemplateEngineInputOptions)
    @optional()
    options: Partial<ITemplateEngineOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ConfigurationError(
        'Invalid template engine options: ' + errors.join(', ')
      );
    }
  }
}
