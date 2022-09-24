import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/build/containers';
import {
  ISchemaParserOptions,
  SchemaReaderType,
} from '@vulcan-sql/build/models';
import { IsOptional, IsString, validateSync } from 'class-validator';
import { ConfigurationError } from '@vulcan-sql/core';

@injectable()
export class SchemaParserOptions implements ISchemaParserOptions {
  @IsString()
  public readonly reader: string = SchemaReaderType.LocalFile;

  @IsString()
  @IsOptional()
  public readonly folderPath!: string;

  constructor(
    @inject(TYPES.SchemaParserInputOptions)
    @optional()
    options: Partial<ISchemaParserOptions> = {}
  ) {
    Object.assign(this, options);
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ConfigurationError(
        'Invalid schema parser options: ' + errors.join(', ')
      );
    }
  }
}
