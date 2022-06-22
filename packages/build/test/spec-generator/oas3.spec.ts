import { OAS3SpecGenerator } from '@vulcan/build/spec-generator';
import { getSchemas, getConfig } from './schema';
import * as jsYaml from 'js-yaml';
import * as fs from 'fs/promises';
import * as path from 'path';
import _ = require('lodash');

const getGenerator = async () => {
  const schema = await getSchemas();
  const config = getConfig();
  return new OAS3SpecGenerator(schema, config);
};

it('Should generate specification without error', async () => {
  // Arrange
  const generator = await getGenerator();
  // Act, Arrange
  expect(async () => {
    const spec = generator.getSpec();
    await fs.writeFile(
      path.resolve(__dirname, 'oas3-spec.yaml'),
      jsYaml.dump(spec),
      'utf-8'
    );
  }).not.toThrow();
});

it('Parameters in path should be converted to correct format', async () => {
  // Arrange
  const generator = await getGenerator();
  // Act
  const spec = generator.getSpec();
  // Arrange
  expect(Object.keys(spec.paths)[0]).toBe('/user/{id}');
  expect(Object.keys(spec.paths)[1]).toBe('/user/{id}/order/{oid}');
  expect(Object.keys(spec.paths)[2]).toBe('/users');
});

it('Should extract the correct parameters', async () => {
  // Arrange
  const generator = await getGenerator();
  // Act
  const spec = generator.getSpec();
  // Arrange
  expect(spec.paths['/user/{id}']?.get.parameters[0]).toEqual(
    expect.objectContaining({
      name: 'id',
      in: 'path',
      schema: expect.objectContaining({
        type: 'string',
      }),
    })
  );
  expect(spec.paths['/user/{id}']?.get.parameters[1]).toEqual(
    expect.objectContaining({
      name: 'agent',
      in: 'header',
      schema: expect.objectContaining({
        type: 'string',
      }),
    })
  );
  expect(spec.paths['/user/{id}']?.get.parameters[2]).toEqual(
    expect.objectContaining({
      name: 'force',
      in: 'query',
      schema: expect.objectContaining({
        type: 'boolean',
      }),
    })
  );
});
