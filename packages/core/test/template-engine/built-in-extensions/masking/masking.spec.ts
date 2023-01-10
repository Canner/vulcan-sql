import { createTestCompiler } from '../../testCompiler';

it('Masking function that exposes the partial letters and adds a custom padding string in the middle', async () => {
  // Arrange
  const { compiler, loader, executeTemplate, getCreatedQueries } =
    await createTestCompiler();

  // {% masking <column-name> <masking-function> %}
  const firstArgs = 2;
  const thirdArgs = 3;
  const unmaskedLength = firstArgs + thirdArgs;
  const { compiledData } = await compiler.compile(
    `{% masking id partial(${firstArgs}, 'xxxxxxx', ${thirdArgs}) %}`
  );

  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test');
  const queries = await getCreatedQueries();

  // Assert
  const pos = thirdArgs - 1;
  expect(queries[0]).toBe(
    `CASE WHEN (length(id) > ${unmaskedLength}) THEN concat(substr(id, 1, $1), $2, substr(id, length(id) - ${pos}, $3)) ELSE $2 END`
  );
});

it('Masking function that exposes part of the first few letters, should work fine', async () => {
  // Arrange
  const { compiler, loader, executeTemplate, getCreatedQueries } =
    await createTestCompiler();

  const firstArgs = 2;
  const thirdArgs = 0;
  const unmaskedLength = firstArgs + thirdArgs;
  const { compiledData } = await compiler.compile(
    `{% masking id partial(${firstArgs}, 'xxxxxxx', ${thirdArgs}) %}`
  );

  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test');
  const queries = await getCreatedQueries();

  // Assert
  expect(queries[0]).toBe(
    `CASE WHEN (length(id) > ${unmaskedLength}) THEN concat(substr(id, 1, $1), $2) ELSE $2 END`
  );
});

it('Allow using set a variable for using partial masking function', async () => {
  // Arrange
  const { compiler, loader, executeTemplate, getCreatedQueries } =
    await createTestCompiler();

  // {% masking <column-name> <masking-function> %}
  const firstArgs = 1;
  const thirdArgs = 2;
  const unmaskedLength = firstArgs + thirdArgs;
  const { compiledData } = await compiler.compile(
    `
{% set suffix = 1 %}
{% masking id partial(${firstArgs}, 'xxxxxxx', suffix + 1) %}
`
  );

  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test');
  const queries = await getCreatedQueries();

  // Assert
  const pos = thirdArgs - 1;
  expect(queries[0]).toBe(
    `CASE WHEN (length(id) > ${unmaskedLength}) THEN concat(substr(id, 1, $1), $2, substr(id, length(id) - ${pos}, $3)) ELSE $2 END`
  );
});

it('If using set an invalid variable, extension should throw', async () => {
  // Arrange
  const { compiler, loader, executeTemplate } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% set padding = 'xxxxxxx' %}
{% masking id partial(1, 'xxxxxxx', suffix) %}
`
  );

  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(executeTemplate('test')).rejects.toThrow(
    `The parameter is invalid`
  );
});

it('Allow using set dynamic parameter for using partial masking function', async () => {
  // Arrange
  const {
    compiler,
    loader,
    executeTemplate,
    getCreatedQueries,
    getCreatedBinding,
  } = await createTestCompiler();

  const padding = 'xxxxx';
  const firstArgs = 1;
  const thirdArgs = 2;
  const unmaskedLength = firstArgs + thirdArgs;
  const { compiledData } = await compiler.compile(
    `
{% set suffix = 1 %}
{% masking id partial(${firstArgs}, context.params.padding, suffix + 1) %}
`
  );

  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test', {
    padding,
  });
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();

  // Assert
  const pos = thirdArgs - 1;
  expect(queries[0]).toBe(
    `CASE WHEN (length(id) > ${unmaskedLength}) THEN concat(substr(id, 1, $1), $2, substr(id, length(id) - ${pos}, $3)) ELSE $2 END`
  );
  expect(binding[0].get('$1')).toBe(firstArgs);
  expect(binding[0].get('$2')).toBe(padding);
  expect(binding[0].get('$3')).toBe(thirdArgs);
});

it('If an argument is not a symbol, extension should throw', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(compiler.compile(`{% masking id %}`)).rejects.toThrow(
    `Expected a symbol, but got a block end`
  );
});

it('If not the partial masking function, extension should throw', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`{% masking id fakeFunc(2, 'xxxxxxx', 2) %}`)
  ).rejects.toThrow(`Unknown function: fakeFunc`);
});

it('If not correct use the masking function, extension should throw', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(compiler.compile(`{% masking id partial %}`)).rejects.toThrow(
    `Expected a function start`
  );
});

it('Parser masking syntax position works fine', async () => {
  const { compiler, loader, executeTemplate, getCreatedQueries } =
    await createTestCompiler();

  const { compiledData } = await compiler.compile(
    `AA{% masking id partial(2, 'xxxxxxx', 3) %}AA`
  );

  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test');
  const queries = await getCreatedQueries();

  // Assert
  expect(queries[0]).toBe(
    `AACASE WHEN (length(id) > 5) THEN concat(substr(id, 1, $1), $2, substr(id, length(id) - 2, $3)) ELSE $2 ENDAA`
  );
});

it('If not correct use the masking function whole syntax, the extension should throw', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`{% masking id partial(2, 'xxxxxxx', 3 %}`)
  ).rejects.toThrow(`Expected a function end`);
});

it('The toleration of spaces for masking function args, extension should work well', async () => {
  // Arrange
  const { compiler, loader, executeTemplate, getCreatedQueries } =
    await createTestCompiler();

  const { compiledData } = await compiler.compile(
    `{% masking id partial(2,                'xxxxxxx'                   , 3) %}`
  );

  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test');
  const queries = await getCreatedQueries();

  // Assert
  expect(queries[0]).toBe(
    `CASE WHEN (length(id) > 5) THEN concat(substr(id, 1, $1), $2, substr(id, length(id) - 2, $3)) ELSE $2 END`
  );
});

it('If only one argument for masking function, extension should throw', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(compiler.compile(`{% masking id partial(2) %}`)).rejects.toThrow(
    `Expected a function has 3 arguments, but got 1`
  );
});

it('If only two arguments for masking function, extension should throw', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`{% masking id partial(2, 'xxxxxxx') %}`)
  ).rejects.toThrow(`Expected a function has 3 arguments, but got 2`);
});

it('If an argument of the partial masking function is a string type, extension should throw', async () => {
  // Arrange
  const { compiler, loader, executeTemplate } = await createTestCompiler();

  const firstArgs = '2';
  const thirdArgs = '3';
  const { compiledData } = await compiler.compile(
    `{% masking id partial('${firstArgs}' | int , 'xxxxxxx', '${thirdArgs}' ) %}`
  );

  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(executeTemplate('test')).rejects.toThrow(
    `The parameter is not number type`
  );
});
