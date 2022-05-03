import { APISchema } from '@vulcan/core';
import { SchemaData, SchemaDataType, SchemaReader } from './schema-reader';
import * as yaml from 'js-yaml';
import middleware, { RawAPISchema, SchemaParserMiddleware } from './middleware';
import * as compose from 'koa-compose';

export interface SchemaParseResult {
  schemas: APISchema[];
}

export class SchemaParser {
  private schemaReader: SchemaReader;
  private middleware: SchemaParserMiddleware[];

  constructor({ schemaReader }: { schemaReader: SchemaReader }) {
    this.schemaReader = schemaReader;
    this.middleware = middleware;
  }

  public async parse(): Promise<SchemaParseResult> {
    const execute = compose(this.middleware);
    const schemas: APISchema[] = [];
    for await (const schemaData of this.schemaReader.readSchema()) {
      const schema = await this.parseContent(schemaData);
      await execute(schema);
      schemas.push(schema as APISchema);
    }
    return { schemas };
  }

  private async parseContent(schemaData: SchemaData): Promise<RawAPISchema> {
    switch (schemaData.type) {
      case SchemaDataType.YAML:
        return {
          name: schemaData.name,
          ...(yaml.load(schemaData.content) as object),
        } as RawAPISchema;
      default:
        throw new Error(`Unsupported schema type: ${schemaData.type}`);
    }
  }
}
