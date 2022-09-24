import { inject } from 'inversify';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';
import {
  APISchema,
  ConfigurationError,
  FieldDataType,
  ResponseProperty,
  TemplateEngine,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/core';
import { unionBy } from 'lodash';

export class ResponseSampler extends SchemaParserMiddleware {
  private templateEngine: TemplateEngine;

  constructor(
    @inject(CORE_TYPES.TemplateEngine) templateEngine: TemplateEngine
  ) {
    super();
    this.templateEngine = templateEngine;
  }

  public async handle(
    rawSchema: RawAPISchema,
    next: () => Promise<void>
  ): Promise<void> {
    await next();
    const schema = rawSchema as APISchema;
    if (!schema.sample) return;
    if (!schema.sample.profile) {
      throw new ConfigurationError(
        `Schema ${schema.urlPath} misses the required property: sample.profile`
      );
    }
    const response = await this.templateEngine.execute(
      schema.templateSource,
      {
        parameters: schema.sample.parameters,
        profileName: schema.sample.profile,
      },
      // We only need the columns of this query, so we set offset/limit both to 0 here.
      {
        limit: 0,
        offset: 0,
      }
    );
    const columns = response.getColumns();
    const responseColumns = this.normalizeResponseColumns(columns);
    schema.response = this.mergeResponse(
      schema.response || [],
      responseColumns
    );
  }

  private normalizeResponseColumns(
    columns: { name: string; type: string }[]
  ): ResponseProperty[] {
    return columns.map((column) => ({
      name: column.name,
      type: column.type.toUpperCase() as FieldDataType,
    }));
  }

  private mergeResponse(
    source: ResponseProperty[],
    target: ResponseProperty[]
  ) {
    return unionBy(source, target, (response) => response.name);
  }
}
