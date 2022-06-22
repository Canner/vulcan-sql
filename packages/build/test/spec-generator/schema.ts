import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';
import { APISchema } from '@vulcan/core';
import * as jsYaml from 'js-yaml';
import { sortBy } from 'lodash';
import { IBuildOptions } from '@vulcan/build';
import compose = require('koa-compose');
import {
  generateDataType,
  normalizeDataType,
  normalizeFieldIn,
  RawAPISchema,
  SchemaParserMiddleware,
  transformValidator,
} from '@vulcan/build/schema-parser/middleware';

const getSchemaPaths = () =>
  new Promise<string[]>((resolve, reject) => {
    glob(path.resolve(__dirname, 'schemas', '*.yaml'), (err, paths) => {
      if (err) return reject(err);
      resolve(sortBy(paths));
    });
  });

export const getSchemas = async () => {
  const schemas: RawAPISchema[] = [];
  const paths = await getSchemaPaths();
  for (const schemaFile of paths) {
    const content = await fs.readFile(schemaFile, 'utf-8');
    schemas.push(jsYaml.load(content) as RawAPISchema);
  }
  // Load some required middleware
  const execute = compose([
    normalizeFieldIn(),
    transformValidator(),
    generateDataType(),
    normalizeDataType(),
  ] as SchemaParserMiddleware[]);
  for (const schema of schemas) {
    await execute(schema);
  }
  return schemas as APISchema[];
};

export const getConfig = (): IBuildOptions => {
  return {
    // We don't care about the options of these components.
    template: {} as any,
    artifact: {} as any,
    schemaParser: {} as any,
  };
};
