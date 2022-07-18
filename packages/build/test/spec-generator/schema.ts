/* eslint @nrwl/nx/enforce-module-boundaries: 0 */
/* istanbul ignore file */
import * as glob from 'glob';
import * as path from 'path';
import { promises as fs } from 'fs';
import {
  APISchema,
  Constraint,
  IValidatorLoader,
  TemplateEngine,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/core';
import * as jsYaml from 'js-yaml';
import { sortBy } from 'lodash';
import { IBuildOptions, TYPES } from '@vulcan-sql/build';
import compose = require('koa-compose');
import {
  RawAPISchema,
  SchemaParserMiddleware,
  SchemaParserMiddlewares,
} from '@vulcan-sql/build/schema-parser/middleware';
import * as sinon from 'ts-sinon';
import { Container } from 'inversify';

const getSchemaPaths = () =>
  new Promise<string[]>((resolve, reject) => {
    glob(path.resolve(__dirname, 'schemas', '*.yaml'), (err, paths) => {
      if (err) return reject(err);
      resolve(sortBy(paths));
    });
  });

const getStubLoader = () => {
  const validatorLoader = sinon.stubInterface<IValidatorLoader>();
  validatorLoader.load.callsFake(async (name) => {
    switch (name) {
      case 'required':
        return {
          name: 'required',
          validateSchema: () => null,
          validateData: () => null,
          getConstraints: () => [Constraint.Required()],
        };
      case 'minValue':
        return {
          name: 'minValue',
          validateSchema: () => null,
          validateData: () => null,
          getConstraints: (args) => [Constraint.MinValue(args.value)],
        };
      case 'maxValue':
        return {
          name: 'maxValue',
          validateSchema: () => null,
          validateData: () => null,
          getConstraints: (args) => [Constraint.MaxValue(args.value)],
        };
      case 'minLength':
        return {
          name: 'minLength',
          validateSchema: () => null,
          validateData: () => null,
          getConstraints: (args) => [Constraint.MinLength(args.value)],
        };
      case 'maxLength':
        return {
          name: 'maxLength',
          validateSchema: () => null,
          validateData: () => null,
          getConstraints: (args) => [Constraint.MaxLength(args.value)],
        };
      case 'regex':
        return {
          name: 'regex',
          validateSchema: () => null,
          validateData: () => null,
          getConstraints: (args) => [Constraint.Regex(args.value)],
        };
      case 'enum':
        return {
          name: 'enum',
          validateSchema: () => null,
          validateData: () => null,
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
  const templateEngine = sinon.stubInterface<TemplateEngine>();
  const container = new Container();
  container.bind(CORE_TYPES.ValidatorLoader).toConstantValue(loader);
  container.bind(CORE_TYPES.TemplateEngine).toConstantValue(templateEngine);
  SchemaParserMiddlewares.forEach((middleware) => {
    container.bind(TYPES.SchemaParserMiddleware).to(middleware);
  });

  const execute = compose(
    container
      .getAll<SchemaParserMiddleware>(TYPES.SchemaParserMiddleware)
      .map((middleware) => middleware.handle.bind(middleware))
  );
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
    extensions: [] as any,
  };
};
