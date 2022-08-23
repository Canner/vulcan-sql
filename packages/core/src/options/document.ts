import { injectable, inject, optional } from 'inversify';
import { IsOptional, IsArray, validateSync, IsString } from 'class-validator';
import { DocumentServerType, DocumentSpec, IDocumentOptions } from '../models';
import { TYPES } from '@vulcan-sql/core/types';

@injectable()
export class DocumentOptions implements IDocumentOptions {
  @IsArray()
  @IsOptional()
  public readonly specs = [DocumentSpec.oas3];

  @IsString()
  public readonly folderPath: string = '.';

  @IsArray()
  public readonly server: string[] = [DocumentServerType.redoc];

  constructor(
    @inject(TYPES.DocumentInputOptions)
    @optional()
    options: Partial<IDocumentOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error(
        'Invalid document generator options: ' + errors.join(', ')
      );
    }
  }
}
