import * as nunjucks from 'nunjucks';
import { walkAst, ParametersVisitor } from '@template-engine';

it('Visitor should return correct parameter', async () => {
  // Arrange
  const ast = nunjucks.parser.parse(
    `
{{ params.a }}{{ params.a.b }}{{ other.params.a }}
{% if params.c and params.d.e %}
  {{ params.f.g | capitalize }}
{% endif %}
    `,
    [],
    {}
  );
  const visitor = new ParametersVisitor({ lookupParameter: 'params' });
  // Act
  walkAst(ast, [visitor]);
  const parameters = visitor.getParameters();
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

it('Visitor should throw error when max depth (100) is reached', async () => {
  // Arrange
  let paramString = 'params';
  for (let i = 0; i < 101; i++) {
    paramString += '.a';
  }
  const ast = nunjucks.parser.parse(`{{ ${paramString} }}`, [], {});
  const visitor = new ParametersVisitor({ lookupParameter: 'params' });
  // Act, Assert
  expect(() => walkAst(ast, [visitor])).toThrow('Max depth reached');
});
