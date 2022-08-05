import { ISchemaParserOptions, SchemaReader } from '@vulcan-sql/build/models';
import { SchemaParser } from '@vulcan-sql/build/schema-parser';
import { AsyncContainerModule, interfaces } from 'inversify';
import { SchemaParserOptions } from '../../options/schemaParser';
import { TYPES } from '../types';
import { SchemaParserMiddlewares } from '@vulcan-sql/build/schema-parser/middleware';

export const schemaParserModule = (options?: ISchemaParserOptions) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<ISchemaParserOptions>(TYPES.SchemaParserInputOptions).toConstantValue(
      options || ({} as any)
    );
    bind<SchemaParserOptions>(TYPES.SchemaParserOptions)
      .to(SchemaParserOptions)
      .inSingletonScope();

    // Schema reader
    bind<SchemaReader>(TYPES.SchemaReader)
      .toDynamicValue((context) => {
        const factory = context.container.get<
          interfaces.AutoNamedFactory<SchemaReader>
        >(TYPES.Factory_SchemaReader);
        const options = context.container.get<SchemaParserOptions>(
          TYPES.SchemaParserOptions
        );
        return factory(options.reader);
      })
      .inSingletonScope();
    bind<interfaces.AutoNamedFactory<SchemaReader>>(
      TYPES.Factory_SchemaReader
    ).toAutoNamedFactory<SchemaReader>(TYPES.Extension_SchemaReader);

    // Schema parser
    bind<SchemaParser>(TYPES.SchemaParser).to(SchemaParser).inSingletonScope();

    // Middleware
    for (const middleware of SchemaParserMiddlewares) {
      bind(TYPES.SchemaParserMiddleware).to(middleware);
    }
  });
