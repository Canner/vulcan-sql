import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/build/containers';
import { IDocumentGeneratorOptions } from '@vulcan-sql/build/models';
import { IsOptional, IsArray, validateSync, IsString } from 'class-validator';

@injectable()
export class DocumentGeneratorOptions implements IDocumentGeneratorOptions {
  @IsArray()
  @IsOptional()
  public readonly specs = ['oas3'];

  @IsString()
  public readonly folderPath!: string;

  constructor(
    @inject(TYPES.DocumentGeneratorInputOptions)
    @optional()
    options: Partial<IDocumentGeneratorOptions> = {}
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
