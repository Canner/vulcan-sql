import {
  createFilterExtension,
  FilterBuilder,
  FilterRunner,
  FunctionalFilter,
} from '@vulcan-sql/core';
import { createTestCompiler } from '../template-engine/testCompiler';
import axios from 'axios';

it('FunctionalFilter should be transformed into two classes: FilterBuilder and FilterRunner', async () => {
  // Arrange
  const testFilter: FunctionalFilter = async () => ``;
  // Act
  const extensions = createFilterExtension('test', testFilter);
  // Assert
  expect(extensions.length).toBe(2);
  expect(new extensions[0]()).toBeInstanceOf(FilterBuilder);
  expect(new extensions[1]()).toBeInstanceOf(FilterRunner);
});

it('The extensions created by createFilter function should work with template engine', async () => {
  // Arrange
  const testFilter: FunctionalFilter = async ({ args, value }) =>
    `QAQ${args['aa']}${value}`;
  const [Builder, Runner] = createFilterExtension('test', testFilter);
  const builder = new Builder({}, '');
  const runner = new Runner({}, '');
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler({ additionalExtensions: [builder, runner] });
  const { compiledData } = await compiler.compile(
    `SELECT {{ context.params.id | test(aa=3) }}`
  );
  loader.setSource('test', compiledData);
  // Act
  await executeTemplate('test', { id: 'QQQQ' });
  const queries = await getCreatedQueries();
  const bindings = await getCreatedBinding();
  // Assert
  expect(queries[0]).toBe('SELECT $1');
  expect(bindings[0].get('$1')).toBe('QAQ3QQQQ');
});

it('V - The call API extensions created by createFilter function should work with template engine', async () => {
  // Arrange
  const callApiFilter: FunctionalFilter = async ({ args, value }) => {
    if (!args['url']) throw Error('url is required');
    const results = await axios.get<Array<any>>(args['url'], {
      params: { [args['arg']]: value },
    });
    return results.data.length as any;
  };

  const [Builder, Runner] = createFilterExtension('call_api', callApiFilter);
  const builder = new Builder({}, '');
  const runner = new Runner({}, '');
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler({ additionalExtensions: [builder, runner] });
  const { compiledData } = await compiler.compile(
    `{% set result = 1990 %}SELECT {{ result | call_api(url='http://localhost:3000/api/artist', arg='begin_date') }}`
  );
  loader.setSource('call_api', compiledData);
  // Act
  await executeTemplate('call_api', {});
  const queries = await getCreatedQueries();
  const bindings = await getCreatedBinding();
  // Assert
  expect(queries[0]).toBe('SELECT $1');
  expect(bindings[0].get('$1')).toBe(10);
}, 10000000);

it('V - The call API extensions created by createFilter function in the {% ... %} should work', async () => {
  // Arrange
  const callApiFilter: FunctionalFilter = async ({ args, value }) => {
    if (!args['url']) throw Error('url is required');
    const results = await axios.get<Array<any>>(args['url'], {
      params: { [args['arg']]: value },
    });
    return results.data.length as any;
  };

  const [Builder, Runner] = createFilterExtension('call_api', callApiFilter);
  const builder = new Builder({}, '');
  const runner = new Runner({}, '');
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler({ additionalExtensions: [builder, runner] });
  const { compiledData } = await compiler.compile(
    `{% set result = 1990 | call_api(url='http://localhost:3000/api/artist', arg='begin_date') %}SELECT {{ result }}`
  );
  loader.setSource('call_api', compiledData);
  // Act
  await executeTemplate('call_api', {});
  const queries = await getCreatedQueries();
  const bindings = await getCreatedBinding();
  // Assert
  expect(queries[0]).toBe('SELECT $1');
  expect(bindings[0].get('$1')).toBe(10);
}, 10000000);

it('V - The call API extensions directly created by createFilter function in the {% ... %} should work', async () => {
  // Arrange
  const callApiFilter: FunctionalFilter = async ({ args, value }) => {
    if (!args['url']) throw Error('url is required');
    const results = await axios.get<Array<any>>(args['url']);
    return results.data.length as any;
  };

  const [Builder, Runner] = createFilterExtension('call_api', callApiFilter);
  const builder = new Builder({}, '');
  const runner = new Runner({}, '');
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler({ additionalExtensions: [builder, runner] });
  const { compiledData } = await compiler.compile(
    `{% set result = '' | call_api(url='http://localhost:3000/api/artists') %}SELECT {{ result }}`
  );
  loader.setSource('call_api', compiledData);
  // Act
  await executeTemplate('call_api', {});
  const queries = await getCreatedQueries();
  const bindings = await getCreatedBinding();
  // Assert
  expect(queries[0]).toBe('SELECT $1');
  expect(bindings[0].get('$1')).toBe(15250);
}, 10000000);

it('V - The call API extensions created by createFilter function and filer length should work', async () => {
  // Arrange
  const callApiFilter: FunctionalFilter = async ({ args, value }) => {
    if (!args['url']) throw Error('url is required');
    const results = await axios.get<Array<any>>(args['url'], {
      params: { [args['arg']]: value },
    });
    return results.data as any;
  };

  const [Builder, Runner] = createFilterExtension('call_api', callApiFilter);
  const builder = new Builder({}, '');
  const runner = new Runner({}, '');
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler({ additionalExtensions: [builder, runner] });
  const { compiledData } = await compiler.compile(
    `{% set result = 1990 %}SELECT {{ result | call_api(url='http://localhost:3000/api/artist', arg='begin_date') | length | string }}`
  );
  loader.setSource('call_api', compiledData);
  // Act
  await executeTemplate('call_api', {});
  const queries = await getCreatedQueries();
  const bindings = await getCreatedBinding();
  // Assert
  expect(queries[0]).toBe('SELECT $1');
  expect(bindings[0].get('$1')).toBe('10');
}, 10000000);
