import {
  APISchema,
  AllTemplateMetadata,
  InternalError,
} from '@vulcan-sql/core';
import {
  SchemaData,
  SchemaFormat,
  SchemaReader,
} from '@vulcan-sql/build/models';
import * as yaml from 'js-yaml';
import { RawAPISchema, SchemaParserMiddleware } from './middleware';
import * as compose from 'koa-compose';
import { inject, injectable, multiInject, optional } from 'inversify';
import { TYPES } from '@vulcan-sql/build/containers';
export interface SchemaParseResult {
  schemas: APISchema[];
}

@injectable()
export class SchemaParser {
  private schemaReader: SchemaReader;
  private middleware: SchemaParserMiddleware['handle'][] = [];

  constructor(
    @inject(TYPES.SchemaReader)
    schemaReader: SchemaReader,
    @multiInject(TYPES.SchemaParserMiddleware)
    @optional()
    middlewares: SchemaParserMiddleware[] = []
  ) {
    this.schemaReader = schemaReader;

    // Load middleware
    middlewares.forEach(this.use.bind(this));
  }

  public async parse({
    metadata,
  }: {
    metadata?: AllTemplateMetadata;
  } = {}): Promise<SchemaParseResult> {
    const execute = compose(this.middleware);
    const schemas: APISchema[] = [];
    for await (const schemaData of this.schemaReader.readSchema()) {
      const schema = await this.parseContent(schemaData);
      schema.metadata = metadata?.[schema.templateSource || schema.sourceName];
      // execute middleware
      await execute(schema);
      schemas.push(schema as APISchema);
    }
    return { schemas };
  }

  public use(middleware: SchemaParserMiddleware): this {
    this.middleware.push(middleware.handle.bind(middleware));
    return this;
  }

  private async parseContent(schemaData: SchemaData): Promise<RawAPISchema> {
    switch (schemaData.type) {
      case SchemaFormat.YAML:
        return {
          sourceName: schemaData.sourceName,
          ...(yaml.load(schemaData.content) as object),
        } as RawAPISchema;
      default:
        throw new InternalError(`Unsupported schema type: ${schemaData.type}`);
    }
  }
}
