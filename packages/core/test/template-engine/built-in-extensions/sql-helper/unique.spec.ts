import { createTestCompiler } from '../../testCompiler';

it('Extension should return correct values without unique by argument', async () => {
  // Arrange
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% set array = [1,2,3,4,4] %}
{% for item in array | unique %}
{{ item }}
{% endfor %}
`
  );
  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test');
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();
  // Assert
  expect(queries[0]).toBe('$1\n$2\n$3\n$4');
  expect(Array.from(binding[0].values())).toEqual([1, 2, 3, 4]);
});

it('Extension should return correct values with unique by keyword argument', async () => {
  // Arrange
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% set array = [{name: "Tom"}, {name: "Tom"}, {name: "Joy"}] %}
{% for item in array | unique(by="name") %}
{{ item.name }}
{% endfor %}
`
  );
  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test');
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();
  // Assert
  expect(queries[0]).toBe('$1\n$2');
  expect(Array.from(binding[0].values())).toEqual(['Tom', 'Joy']);
});

it('Extension should return correct values with unique by argument', async () => {
  // Arrange
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% set array = [{name: "Tom"}, {name: "Tom"}, {name: "Joy"}] %}
{% for item in array | unique("name") %}
{{ item.name }}
{% endfor %}
`
  );
  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test');
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();
  // Assert
  expect(queries[0]).toBe('$1\n$2');
  expect(Array.from(binding[0].values())).toEqual(['Tom', 'Joy']);
});
