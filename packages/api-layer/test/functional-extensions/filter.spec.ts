import {
  createFilterExtension,
  FilterBuilder,
  FilterRunner,
  FunctionalFilter,
} from '@vulcan-sql/api-layer';
import { createTestCompiler } from '../template-engine/testCompiler';

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
