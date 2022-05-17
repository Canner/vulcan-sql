import { injectable, inject, optional } from 'inversify';
import { TYPES } from '@vulcan/build/containers';
import { ISchemaParserOptions, SchemaReaderType } from '@vulcan/build/models';

@injectable()
export class SchemaParserOptions implements ISchemaParserOptions {
  public readonly reader!: SchemaReaderType;
  public readonly schemaPath!: string;

  constructor(
    @inject(TYPES.SchemaParserInputOptions)
    @optional()
    options: Partial<ISchemaParserOptions> = {}
  ) {
    Object.assign(this, options);
  }
}
