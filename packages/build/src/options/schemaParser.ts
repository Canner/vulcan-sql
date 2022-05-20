import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan/build/containers';
import { ISchemaParserOptions, SchemaReaderType } from '@vulcan/build/models';
import { IsOptional, IsString, validateSync } from 'class-validator';

@injectable()
export class SchemaParserOptions implements ISchemaParserOptions {
  @IsString()
  public readonly reader: SchemaReaderType = SchemaReaderType.LocalFile;

  @IsString()
  @IsOptional()
  public readonly schemaPath!: string;

  constructor(
    @inject(TYPES.SchemaParserInputOptions)
    @optional()
    options: Partial<ISchemaParserOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new Error('Invalid schema parser options: ' + errors.join(', '));
    }
  }
}
