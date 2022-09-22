import { RawAPISchema, SchemaParserMiddleware } from './middleware';
import { APISchema, DataSource, TYPES as CORE_TYPES } from '@vulcan-sql/core';
import { inject, interfaces } from 'inversify';

export class CheckProfile extends SchemaParserMiddleware {
  private dataSourceFactory: interfaces.SimpleFactory<DataSource>;

  constructor(
    @inject(CORE_TYPES.Factory_DataSource)
    dataSourceFactory: interfaces.SimpleFactory<DataSource>
  ) {
    super();
    this.dataSourceFactory = dataSourceFactory;
  }

  public async handle(schemas: RawAPISchema, next: () => Promise<void>) {
    await next();
    const transformedSchemas = schemas as APISchema;
    if (!transformedSchemas.profile)
      throw new Error(
        `The profile of schema ${transformedSchemas.urlPath} is not defined`
      );

    try {
      this.dataSourceFactory(transformedSchemas.profile);
    } catch (e: any) {
      throw new Error(
        `The profile of schema ${transformedSchemas.urlPath} is invalid: ${e?.message}`
      );
    }
  }
}
