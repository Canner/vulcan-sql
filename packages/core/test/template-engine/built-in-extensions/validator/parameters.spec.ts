import { createTestCompiler } from '../../testCompiler';

it('Extension should return correct parameter list', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(`
{{ params.a }}{{ params.a.b }}{{ other.params.a }}
{% if params.c and params.d.e %}
  {{ params.f.g | capitalize }}
{% endif %}
      `);
  const parameters = metadata['parameter.vulcan.com'];
  // Assert
  expect(parameters.length).toBe(7);
  expect(parameters).toContainEqual({
    name: 'a',
    locations: [
      { lineNo: 1, columnNo: 9 },
      { lineNo: 1, columnNo: 23 },
    ],
  });
  expect(parameters).toContainEqual({
    name: 'a.b',
    locations: [{ lineNo: 1, columnNo: 25 }],
  });
  expect(parameters).toContainEqual({
    name: 'c',
    locations: [{ lineNo: 2, columnNo: 12 }],
  });
  expect(parameters).toContainEqual({
    name: 'd',
    locations: [{ lineNo: 2, columnNo: 25 }],
  });
  expect(parameters).toContainEqual({
    name: 'd.e',
    locations: [{ lineNo: 2, columnNo: 27 }],
  });
  expect(parameters).toContainEqual({
    name: 'f',
    locations: [{ lineNo: 3, columnNo: 11 }],
  });
  expect(parameters).toContainEqual({
    name: 'f.g',
    locations: [{ lineNo: 3, columnNo: 13 }],
  });
});
