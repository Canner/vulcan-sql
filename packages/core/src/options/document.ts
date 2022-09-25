import { injectable, inject, optional } from 'inversify';
import { IsOptional, IsArray, validateSync } from 'class-validator';
import { DocumentRouterType, DocumentSpec, IDocumentOptions } from '../models';
import { TYPES } from '@vulcan-sql/core/types';
import { ConfigurationError } from '../lib/utils/errors';

@injectable()
export class DocumentOptions implements IDocumentOptions {
  @IsArray()
  @IsOptional()
  public readonly specs: string[] = [DocumentSpec.oas3];

  @IsArray()
  public readonly router: string[] = [DocumentRouterType.redoc];

  constructor(
    @inject(TYPES.DocumentInputOptions)
    @optional()
    options: Partial<IDocumentOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ConfigurationError(
        'Invalid document generator options: ' + errors.join(', ')
      );
    }
  }
}
