import { arrayToStream, streamToArray } from '@vulcan-sql/core/utils';
import { createTestCompiler } from '../../testCompiler';

it('Extension should be compiled successfully when exist symbol "variable" after "cache" tag', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`{% cache variable %} some statement {% endcache %}`)
  ).resolves.not.toThrow();
});

it('Extension should be compiled successfully when the token is end block after "cache" tag', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`{% cache %} some statement {% endcache %}`)
  ).resolves.not.toThrow();
});

it('Extension should be compiled failed and throw error when the token is end block after "cache" tag', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`{% cache %} some statement {% endcache variable %}`)
  ).rejects.toThrow();
});

it('Extension should be compiled failed if there is more than one arguments after "cache" tag', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`
{% cache variable more %}
select count(*) as count from user where user.id = '{{ params.userId }}';
{% endcache %}
  `)
  ).rejects.toThrow(`Expected a block end, but got symbol`);
});

it('Extension should be compiled failed if argument is not a symbol or end block, ', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`
{% cache "variable" %}
select count(*) as count from user where user.id = '{{ params.userId }}';
{% endcache %}
  `)
  ).rejects.toThrow(`Expected a symbol or a block end, but got string`);
});

it('Extension should be compiled failed when exist multiple "cache" without variable tags', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`
  {% cache %} some statement1 {% endcache %}
  {% cache %} some statement2 {% endcache %}
    `)
  ).rejects.toThrow();
});

it('Extension should be compiled failed when exist multiple "cache" with same variable tags', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`
  {% cache variable %} some statement1 {% endcache %}
  {% cache variable %} some statement2 {% endcache %}
    `)
  ).rejects.toThrow();
});

it('Extension should be compiled successfully when exist multiple "cache" with different variable tags', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`
  {% cache variable1 %} some statement1 {% endcache %}
  {% cache variable2 %} some statement2 {% endcache %}
    `)
  ).resolves.not.toThrow();
});

it('Extension should be compiled successfully even if not have query statement body in "cache" scope tag', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`{% cache %}{% endcache %}`)
  ).resolves.not.toThrow();
});

it.each([
  ['{% cache %} some statement {% endcache %}'],
  ['{% cache %}{% endcache %}'],
])(
  'The metadata should include "isUsedTag" is true in "cache.vulcan.com" after compiled "%s" SQL statement',
  async (sql) => {
    // Arrange
    const { compiler } = await createTestCompiler();

    // Action
    const { metadata } = await compiler.compile(sql);

    // Action, Assert
    await expect(metadata).toMatchObject({
      'cache.vulcan.com': { isUsedTag: true },
    });
  }
);

it('The metadata should include "isUsedTag" is false in "cache.vulcan.com" after compiled', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action
  const { metadata } = await compiler.compile('some statement');

  // Action, Assert
  await expect(metadata).toMatchObject({
    'cache.vulcan.com': { isUsedTag: false },
  });
});

it('Extension should execute correct query and set/export the variable', async () => {
  // Arrange
  const {
    compiler,
    loader,
    builder,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler();
  const { compiledData } = await compiler.compile(`
{% cache %}
select count(*) as count from vulcan.user where user.id = {{ context.params.userId }};
{% endcache %}
  `);
  builder.value.onFirstCall().resolves({
    getColumns: () => [],
    getData: () => arrayToStream([{ count: 1 }]),
  });
  // Action
  loader.setSource('test', compiledData);
  const result = await executeTemplate('test', {
    userId: 'user-id',
  });
  const resultData = await streamToArray(result.getData());
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();
  // Assert, cache tag runner add the "set schema=vulcan;" in the prefix sql statement to make query could get correct cache table of schema.
  expect(queries[0]).toBe(
    `set schema=vulcan;\nselect count(*) as count from vulcan.user where user.id = $1;`
  );
  expect(binding[0].get('$1')).toBe(`user-id`);
  expect(resultData).toEqual([{ count: 1 }]);
});

it('Extension should remove comments in sql statements', async () => {
  // Arrange
  const {
    compiler,
    loader,
    builder,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler();
  const { compiledData } = await compiler.compile(`
-- this is comment1
{% cache %} -- this is comment2
select count(*) as count from vulcan.user where user.id = {{ context.params.userId }}; -- this is comment3
{% endcache %} -- this is comment4
-- this is comment5
  `);
  builder.value.onFirstCall().resolves({
    getColumns: () => [],
    getData: () => arrayToStream([{ count: 1 }]),
  });
  // Action
  loader.setSource('test', compiledData);
  const result = await executeTemplate('test', {
    userId: 'user-id',
  });
  const resultData = await streamToArray(result.getData());
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();

  // Assert, cache tag runner add the "set schema=vulcan;" in the prefix sql statement to make query could get correct cache table of schema.
  expect(queries[0].trim()).toBe(
    `set schema=vulcan;\n select count(*) as count from vulcan.user where user.id = $1;`
  );
  expect(binding[0].get('$1')).toBe(`user-id`);
  expect(resultData).toEqual([{ count: 1 }]);
});
