import {
  createTagExtension,
  FunctionalTag,
  TagBuilder,
  TagRunner,
} from '@vulcan-sql/core';
import { createTestCompiler } from '../template-engine/testCompiler';
import axios from 'axios';
it('FunctionalTag should be transformed into two classes: TagBuilder and TagRunner', async () => {
  // Arrange
  const testTag: FunctionalTag = async () => ``;
  // Act
  const extensions = createTagExtension('test', testTag);
  // Assert
  expect(extensions.length).toBe(2);
  expect(new extensions[0]()).toBeInstanceOf(TagBuilder);
  expect(new extensions[1]()).toBeInstanceOf(TagRunner);
});

it('The extensions created by createTag function should work with template engine', async () => {
  // Arrange
  const testTag: FunctionalTag = async ({ args, sql }) =>
    `QAQ${args['aa']}${sql}`;
  const [Builder, Runner] = createTagExtension('test', testTag);
  const builder = new Builder({}, '');
  const runner = new Runner({}, '');
  const { compiler, loader, executeTemplate, getCreatedQueries } =
    await createTestCompiler({ additionalExtensions: [builder, runner] });
  const { compiledData } = await compiler.compile(
    `SELECT {% test aa=3 %}QQQQ{% endtest %}`
  );
  loader.setSource('test', compiledData);
  // Act
  await executeTemplate('test', {});
  const queries = await getCreatedQueries();
  // Assert
  expect(queries[0]).toBe('SELECT QAQ3QQQQ');
});

it('The call API extensions created by createTag function should work with template engine', async () => {
  // Arrange
  const callApiTag: FunctionalTag = async ({ args, sql }) => {
    if (!args['url']) throw Error('url is required');
    const results = await axios.get<Array<any>>(args['url'], {
      params: { [args['arg']]: sql },
    });
    return results.data.length.toString();
  };

  const [Builder, Runner] = createTagExtension('call_api', callApiTag);
  const builder = new Builder({}, '');
  const runner = new Runner({}, '');
  const { compiler, loader, executeTemplate, getCreatedQueries } =
    await createTestCompiler({ additionalExtensions: [builder, runner] });
  const { compiledData } = await compiler.compile(
    `SELECT {% call_api url='http://localhost:3000/api/artist', arg='begin_date' %}1990{% endcall_api %}`
  );
  loader.setSource('call_api', compiledData);
  // Act
  await executeTemplate('call_api', {});
  const queries = await getCreatedQueries();
  // Assert
  expect(queries[0]).toBe('SELECT 10');
}, 10000000);
