import { createTestCompiler } from '../../testCompiler';

it('Extension should return correct parameter list', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(`
{{ context.params.a }}{{ context.params.a.b }}{{ other.params.a }}
{% if context.params.c and context.params.d.e %}
  {{ context.params.f.g | capitalize }}
{% endif %}
      `);
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(7);
  expect(parameters).toContainEqual({
    name: 'a',
    locations: [
      { lineNo: 1, columnNo: 17 },
      { lineNo: 1, columnNo: 39 },
    ],
    validators: [],
  });
  expect(parameters).toContainEqual({
    name: 'a.b',
    locations: [{ lineNo: 1, columnNo: 41 }],
    validators: [],
  });
  expect(parameters).toContainEqual({
    name: 'c',
    locations: [{ lineNo: 2, columnNo: 20 }],
    validators: [],
  });
  expect(parameters).toContainEqual({
    name: 'd',
    locations: [{ lineNo: 2, columnNo: 41 }],
    validators: [],
  });
  expect(parameters).toContainEqual({
    name: 'd.e',
    locations: [{ lineNo: 2, columnNo: 43 }],
    validators: [],
  });
  expect(parameters).toContainEqual({
    name: 'f',
    locations: [{ lineNo: 3, columnNo: 19 }],
    validators: [],
  });
  expect(parameters).toContainEqual({
    name: 'f.g',
    locations: [{ lineNo: 3, columnNo: 21 }],
    validators: [],
  });
});

it('Extension should extract validator and arguments from preCheck validation filters', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(
    `{{ context.params.a | is_integer(someNumber=10, someString=":)", someBool=true) }}`
  );
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(1);
  expect(parameters[0]).toEqual({
    name: 'a',
    locations: [
      {
        lineNo: 0,
        columnNo: 17,
      },
    ],
    validators: [
      {
        name: 'integer',
        args: { someNumber: 10, someString: ':)', someBool: true },
      },
    ],
  });
});

it('Extension should accept preCheck validation filters without argument', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(
    `{{ context.params.a | is_required }}`
  );
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(1);
  expect(parameters[0]).toEqual({
    name: 'a',
    locations: [
      {
        lineNo: 0,
        columnNo: 17,
      },
    ],
    validators: [
      {
        name: 'required',
        args: {},
      },
    ],
  });
});

it('Validation filters with dynamic arguments should not be preCheck validation filters', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(
    `{{ context.params.a | is_integer(someNumber=a) }}`
  );
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(1);
  expect(parameters[0]).toEqual({
    name: 'a',
    locations: [
      {
        lineNo: 0,
        columnNo: 17,
      },
    ],
    validators: [],
  });
});

it('Validation filters which is not applied right after parameters should not be preCheck validation filters', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(
    `{{ context.params.a | abs | is_integer(someNumber=a) }}`
  );
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(1);
  expect(parameters[0]).toEqual({
    name: 'a',
    locations: [
      {
        lineNo: 0,
        columnNo: 17,
      },
    ],
    validators: [],
  });
});

it('PreCheck validation filters are chainable', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(
    `{{ context.params.a | is_integer(max=10) | is_integer(min=0) | is_date(format="yyyy/mm/dd") | abs }}`
  );
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(1);
  expect(parameters[0]).toEqual({
    name: 'a',
    locations: [
      {
        lineNo: 0,
        columnNo: 17,
      },
    ],
    validators: [
      {
        name: 'integer',
        args: { max: 10 },
      },
      {
        name: 'integer',
        args: { min: 0 },
      },
      {
        name: 'date',
        args: { format: 'yyyy/mm/dd' },
      },
    ],
  });
});

it('Different preCheck validation filters can be added to the same parameters', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(`
{{ context.params.a | is_integer(max=10) }}
{{ context.params.a | is_integer(min=2) | is_date(format="yyyy/mm/dd") }}
{{ context.params.a | abs | is_integer(min=20) }}
`);
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(1);
  expect(parameters[0]).toEqual({
    name: 'a',
    locations: [
      {
        lineNo: 1,
        columnNo: 17,
      },
      {
        lineNo: 2,
        columnNo: 17,
      },
      {
        lineNo: 3,
        columnNo: 17,
      },
    ],
    validators: [
      {
        name: 'integer',
        args: { max: 10 },
      },
      {
        name: 'integer',
        args: { min: 2 },
      },
      {
        name: 'date',
        args: { format: 'yyyy/mm/dd' },
      },
    ],
  });
});

it('Validation filters which is applied to the children of parameters should not be preCheck validation filters', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(`
{{ context.params.a.b | is_integer(max=10) }}
`);
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(2);
  expect(parameters[0]).toEqual({
    name: 'a.b',
    locations: [
      {
        lineNo: 1,
        columnNo: 19,
      },
    ],
    validators: [],
  });
  expect(parameters[1]).toEqual({
    name: 'a',
    locations: [
      {
        lineNo: 1,
        columnNo: 17,
      },
    ],
    validators: [],
  });
});

it('Extension should reject the validation filter when invalid arguments', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act, Assert
  await expect(
    compiler.compile(`
{{ context.params.a.b | is_integer(10) }}
`)
  ).rejects.toThrow(`The arguments of validation filter is_integer is invalid`);
});

it('Validation filters with array arguments should be preCheck validation filters', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(
    `{{ context.params.a | is_enum(items=[1,"2",true]) }}`
  );
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(1);
  expect(parameters[0]).toEqual({
    name: 'a',
    locations: [
      {
        lineNo: 0,
        columnNo: 17,
      },
    ],
    validators: [
      {
        name: 'enum',
        args: { items: [1, '2', true] },
      },
    ],
  });
});

it('Validation filters with dynamic array arguments should not be preCheck validation filters', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(
    `{{ context.params.a | is_enum(item=[1,2,3,a]) }}`
  );
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(1);
  expect(parameters[0]).toEqual({
    name: 'a',
    locations: [
      {
        lineNo: 0,
        columnNo: 17,
      },
    ],
    validators: [],
  });
});
