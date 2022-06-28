/* eslint @nrwl/nx/enforce-module-boundaries: 0 */
/* istanbul ignore file */
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs/promises';
import {
  APISchema,
  Constraint,
  IValidator,
  ValidatorLoader,
} from '@vulcan/core';
import * as jsYaml from 'js-yaml';
import { sortBy } from 'lodash';
import { IBuildOptions } from '@vulcan/build';
import compose = require('koa-compose');
import {
  generateDataType,
  normalizeDataType,
  normalizeFieldIn,
  setConstraints,
  RawAPISchema,
  SchemaParserMiddleware,
  transformValidator,
} from '@vulcan/build/schema-parser/middleware';
import * as sinon from 'ts-sinon';

const getSchemaPaths = () =>
  new Promise<string[]>((resolve, reject) => {
    glob(path.resolve(__dirname, 'schemas', '*.yaml'), (err, paths) => {
      if (err) return reject(err);
      resolve(sortBy(paths));
    });
  });

const getStubLoader = () => {
  const validatorLoader = sinon.stubInterface<ValidatorLoader>();
  validatorLoader.getLoader.callsFake((name): IValidator => {
    switch (name) {
      case 'required':
        return {
          name: 'required',
          validateSchema: () => true,
          validateData: () => true,
          getConstraints: () => [Constraint.Required()],
        };
      case 'minValue':
        return {
          name: 'minValue',
          validateSchema: () => true,
          validateData: () => true,
          getConstraints: (args) => [Constraint.MinValue(args.value)],
        };
      case 'maxValue':
        return {
          name: 'maxValue',
          validateSchema: () => true,
          validateData: () => true,
          getConstraints: (args) => [Constraint.MaxValue(args.value)],
        };
      case 'minLength':
        return {
          name: 'minLength',
          validateSchema: () => true,
          validateData: () => true,
          getConstraints: (args) => [Constraint.MinLength(args.value)],
        };
      case 'maxLength':
        return {
          name: 'maxLength',
          validateSchema: () => true,
          validateData: () => true,
          getConstraints: (args) => [Constraint.MaxLength(args.value)],
        };
      case 'regex':
        return {
          name: 'regex',
          validateSchema: () => true,
          validateData: () => true,
          getConstraints: (args) => [Constraint.Regex(args.value)],
        };
      case 'enum':
        return {
          name: 'enum',
          validateSchema: () => true,
          validateData: () => true,
          getConstraints: (args) => [Constraint.Enum(args.value)],
        };
      default:
        throw new Error(`Validator ${name} is not implemented in test bed.`);
    }
  });
  return validatorLoader;
};

export const getSchemas = async () => {
  const schemas: RawAPISchema[] = [];
  const paths = await getSchemaPaths();
  for (const schemaFile of paths) {
    const content = await fs.readFile(schemaFile, 'utf-8');
    schemas.push(jsYaml.load(content) as RawAPISchema);
  }
  const loader = getStubLoader();
  // Load some required middleware
  const execute = compose([
    normalizeFieldIn(),
    transformValidator(),
    generateDataType(),
    normalizeDataType(),
    setConstraints(loader),
  ] as SchemaParserMiddleware[]);
  for (const schema of schemas) {
    await execute(schema);
  }
  return schemas as APISchema[];
};

export const getConfig = (): IBuildOptions => {
  return {
    name: 'An API schema for testing',
    version: '1.2.3',
    description: `Some description with **markdown** supported.`,
    // We don't care about the options of these components.
    template: {} as any,
    artifact: {} as any,
    schemaParser: {} as any,
  };
};
