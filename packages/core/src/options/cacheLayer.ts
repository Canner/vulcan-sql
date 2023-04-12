import { injectable, inject, optional } from 'inversify';
import { IsOptional, IsString, validateSync } from 'class-validator';
import { TYPES } from '@vulcan-sql/core/types';
import {
  CacheLayerProviderType,
  CacheLayerStoreLoaderType,
  ICacheLayerOptions,
} from '@vulcan-sql/core/models';
import { ConfigurationError } from '../lib/utils/errors';

@injectable()
export class CacheLayerOptions implements ICacheLayerOptions {
  @IsString()
  @IsOptional()
  public readonly provider?: string = CacheLayerProviderType.LocalFile;

  @IsString()
  @IsOptional()
  public readonly folderPath!: string;

  @IsString()
  @IsOptional()
  public readonly loader: string = CacheLayerStoreLoaderType.DuckDB;

  constructor(
    @inject(TYPES.CacheLayerInputOptions)
    @optional()
    options: Partial<ICacheLayerOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ConfigurationError(
        'Invalid data cache options: ' + errors.join(', ')
      );
    }
  }
}
