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
    if (!schemas.profiles && schemas.profile) {
      schemas.profiles = [schemas.profile];
    }

    await next();
    const transformedSchemas = schemas as APISchema;
    if (!transformedSchemas.profiles)
      throw new Error(
        `The profile of schema ${transformedSchemas.urlPath} is not defined`
      );

    for (const profile of transformedSchemas.profiles) {
      try {
        this.dataSourceFactory(profile);
      } catch (e: any) {
        throw new Error(
          `The profile ${profile} of schema ${transformedSchemas.urlPath} is invalid: ${e?.message}`
        );
      }
    }
  }
}
