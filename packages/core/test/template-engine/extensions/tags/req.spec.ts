import { createTestCompiler } from '../../testCompiler';

it('req extension should execute correct query and set variable', async () => {
  // Arrange
  const { compiler, loader, builder, executor } = createTestCompiler();
  const { compiledData } = compiler.compile(`
{% req userCount main %}
select count(*) as count from user where user.id = '{{ params.userId }}';
{% endreq %}
  `);
  builder.value.onFirstCall().resolves([{ count: 1 }]);
  // Action
  loader.setSource('test', compiledData);
  const result = await compiler.execute('test', {
    params: { userId: 'user-id' },
  });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe(
    `select count(*) as count from user where user.id = 'user-id';`
  );
  expect(result).toEqual([{ count: 1 }]);
});

it('if argument is not a symbol, extension should throw', async () => {
  // Arrange
  const { compiler } = createTestCompiler();

  // Action, Assert
  expect(() =>
    compiler.compile(`
{% req "userCount" %}
select count(*) as count from user where user.id = '{{ params.userId }}';
{% endreq %}
  `)
  ).toThrow(`Expected a symbol, but got string`);
});

it('if argument is missing, extension should throw', async () => {
  // Arrange
  const { compiler } = createTestCompiler();

  // Action, Assert
  expect(() =>
    compiler.compile(`
{% req %}
select count(*) as count from user where user.id = '{{ params.userId }}';
{% endreq %}
  `)
  ).toThrow(`Expected a variable`);
});

it('if the main denotation is replaces other keywords than "main", extension should throw an error', async () => {
  // Arrange
  const { compiler } = createTestCompiler();

  // Action, Assert
  expect(() =>
    compiler.compile(`
{% req user super %}
some statement
{% endreq %}
  `)
  ).toThrow(`Expected a symbol "main"`);
});

it('the main denotation should be parsed into the second args node', async () => {
  // Arrange
  const { compiler } = createTestCompiler();

  // Action
  const { ast: astWithMainBuilder } = compiler.generateAst(
    `{% req user main %} some statement {% endreq %}`
  );

  // Assert
  expect((astWithMainBuilder as any).children[0].args.children[1].value).toBe(
    'true'
  );
});
