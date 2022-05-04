import { APISchema, IValidator } from '@vulcan/core';
import { SchemaData, SchemaDataType, SchemaReader } from './schema-reader';
import * as yaml from 'js-yaml';
import {
  RawAPISchema,
  SchemaParserMiddleware,
  generateUrl,
  checkValidator,
  transformValidator,
  generateTemplateSource,
} from './middleware';
import * as compose from 'koa-compose';

/**
 * Temporary interface
 * @deprecated
 */
export interface ValidatorLoader {
  getLoader(name: string): IValidator;
}

export interface SchemaParseResult {
  schemas: APISchema[];
}

export class SchemaParser {
  private schemaReader: SchemaReader;
  private middleware: SchemaParserMiddleware[] = [];

  constructor({
    schemaReader,
    validatorLoader,
  }: {
    schemaReader: SchemaReader;
    validatorLoader: ValidatorLoader;
  }) {
    this.schemaReader = schemaReader;
    this.use(generateUrl());
    this.use(generateTemplateSource());
    this.use(transformValidator());
    this.use(checkValidator(validatorLoader));
  }

  public async parse(): Promise<SchemaParseResult> {
    const execute = compose(this.middleware);
    const schemas: APISchema[] = [];
    for await (const schemaData of this.schemaReader.readSchema()) {
      const schema = await this.parseContent(schemaData);
      // execute middleware
      await execute(schema);
      schemas.push(schema as APISchema);
    }
    return { schemas };
  }

  public use(middleware: SchemaParserMiddleware): this {
    this.middleware.push(middleware);
    return this;
  }

  private async parseContent(schemaData: SchemaData): Promise<RawAPISchema> {
    switch (schemaData.type) {
      case SchemaDataType.YAML:
        return {
          sourceName: schemaData.name,
          ...(yaml.load(schemaData.content) as object),
        } as RawAPISchema;
      default:
        throw new Error(`Unsupported schema type: ${schemaData.type}`);
    }
  }
}
