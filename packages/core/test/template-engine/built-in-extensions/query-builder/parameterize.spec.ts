import { createTestCompiler } from '../../testCompiler';

it('Should parameterize input parameters', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `select * from users where id = {{ context.params.id }} or name = {{ context.params.name }}`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { id: 1, name: 'freda' } },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe(
    `select * from users where id = $1 or name = $2`
  );
  expect(executor.createBuilder.firstCall.args[1].get('$1')).toBe(1);
  expect(executor.createBuilder.firstCall.args[1].get('$2')).toBe('freda');
});

it('Should parameterize all lookup or function call nodes', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{% set someVar = context.params.id %}
{{ someVar }}
{{ someVar + 1 }}
{{ context.someFunction() }}
{{ context.someFunction() + '!' }}
{{ context.complexObj.func()().func2().a.b }}
`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: {
      params: { id: 1, name: 'freda' },
      someFunction: () => 'functionResult',
      complexObj: {
        func: () => () => ({
          func2: () => ({
            a: { b: 'complexResult' },
          }),
        }),
      },
    },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe(`$1\n$11\n$2\n$2!\n$3`);
  expect(executor.createBuilder.firstCall.args[1].get('$1')).toBe(1);
  expect(executor.createBuilder.firstCall.args[1].get('$2')).toBe(
    'functionResult'
  );
  expect(executor.createBuilder.firstCall.args[1].get('$3')).toBe(
    'complexResult'
  );
});

it('Should reuse the parameter with same values', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{{ context.params.id }}{{ context.params.name }}{{ context.params.id }}`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { id: 1, name: 'freda' } },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe(`$1$2$1`);
  expect(executor.createBuilder.firstCall.args[1].get('$1')).toBe(1);
  expect(executor.createBuilder.firstCall.args[1].get('$2')).toBe('freda');
});

it('Should reset the index with new request', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% req user %}
select * from users where name = {{ context.params.name }}
{% endreq %}
select * from groups where userId = {{ user.value()[0].id }}
`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { name: 'freda' } },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe(
    `select * from users where name = $1`
  );
  expect(executor.createBuilder.firstCall.args[1].get('$1')).toBe('freda');
  expect(executor.createBuilder.secondCall.args[0]).toBe(
    `select * from groups where userId = $1`
  );
  expect(executor.createBuilder.secondCall.args[1].get('$1')).toBe(1);
});

it('Should use raw value to handle application logic', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{% if context.params.id == 1 %}This should be rendered - {{ context.params.id }}{% endif %}
{% set someVar = context.params.id + 1 %}
{% if someVar == 2 %}This should be rendered - {{ someVar }}{% endif %}
{% set someArray = [5,6,7] %}
{% for val in someArray %}
{{ val }}
{% endfor %}
`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { id: 1 } },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe(
    `This should be rendered - $1
This should be rendered - $2
$3
$4
$5`
  );
  expect(executor.createBuilder.firstCall.args[1].get('$1')).toBe(1);
  expect(executor.createBuilder.firstCall.args[1].get('$2')).toBe(2);
  expect(executor.createBuilder.firstCall.args[1].get('$3')).toBe(5);
  expect(executor.createBuilder.firstCall.args[1].get('$4')).toBe(6);
  expect(executor.createBuilder.firstCall.args[1].get('$5')).toBe(7);
});

it('The binding keys should be in order which they are used', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{{ context.params.name }}{{ context.params.id }}`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { id: 1, name: 'freda' } },
  });
  // Assert
  expect(Array.from(executor.createBuilder.firstCall.args[1].keys())).toEqual([
    '$1',
    '$2',
  ]);
});

it('Should render raw value when using raw filter', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{{ context.params.id | raw }}{{ context.params.name | upper | raw }}`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { id: 1, name: 'freda' } },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('1FREDA');
});

it('Raw value should be wrapped again when accessing its children', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{{ (context.params.data | raw).name }}`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { data: { id: 1, name: 'freda' } } },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('$1');
  expect(executor.createBuilder.firstCall.args[1].get('$1')).toBe('freda');
});

it('Raw value should be wrapped again when raw filter is chaining again', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{{ context.params.name | raw | upper }}`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { name: 'freda' } },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('$1');
  expect(executor.createBuilder.firstCall.args[1].get('$1')).toBe('FREDA');
});

it('Raw value should be wrapped again when it is assigned to variables and is rendered', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `{% set someVar = (context.params.name | upper | raw) %}
{% if someVar == "FREDA" %}This should be rendered{% endif %}
{{ someVar }}`
  );
  builder.value.onFirstCall().resolves([{ id: 1, name: 'freda' }]);
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    context: { params: { name: 'freda' } },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe(
    'This should be rendered\n$1'
  );
  expect(executor.createBuilder.firstCall.args[1].get('$1')).toBe('FREDA');
});
