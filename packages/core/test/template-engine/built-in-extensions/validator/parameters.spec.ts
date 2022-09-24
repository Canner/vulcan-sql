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
  });
  expect(parameters).toContainEqual({
    name: 'a.b',
    locations: [{ lineNo: 1, columnNo: 41 }],
  });
  expect(parameters).toContainEqual({
    name: 'c',
    locations: [{ lineNo: 2, columnNo: 20 }],
  });
  expect(parameters).toContainEqual({
    name: 'd',
    locations: [{ lineNo: 2, columnNo: 41 }],
  });
  expect(parameters).toContainEqual({
    name: 'd.e',
    locations: [{ lineNo: 2, columnNo: 43 }],
  });
  expect(parameters).toContainEqual({
    name: 'f',
    locations: [{ lineNo: 3, columnNo: 19 }],
  });
  expect(parameters).toContainEqual({
    name: 'f.g',
    locations: [{ lineNo: 3, columnNo: 21 }],
  });
});
