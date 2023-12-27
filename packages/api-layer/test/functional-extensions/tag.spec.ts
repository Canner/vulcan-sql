import {
  createTagExtension,
  FunctionalTag,
  TagBuilder,
  TagRunner,
} from '@vulcan-sql/api-layer';
import { createTestCompiler } from '../template-engine/testCompiler';

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
