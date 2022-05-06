import * as nunjucks from 'nunjucks';
import { walkAst } from '../../../../src/lib/template-engine/compilers/nunjucks/astWalker';
import { ParameterVisitor } from '../../../../src/lib/template-engine/compilers/nunjucks/visitors';

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
  const visitor = new ParameterVisitor({ lookupParameter: 'params' });
  // Act
  walkAst(ast, [visitor]);
  const parameters = visitor.getParameters();
  // Assert
  expect(parameters.length).toBe(7);
  expect(parameters).toContain('a');
  expect(parameters).toContain('a.b');
  expect(parameters).toContain('c');
  expect(parameters).toContain('d');
  expect(parameters).toContain('d.e');
  expect(parameters).toContain('f');
  expect(parameters).toContain('f.g');
});

it('Visitor should throw error when max depth (100) is reached', async () => {
  // Arrange
  let paramString = 'params';
  for (let i = 0; i < 101; i++) {
    paramString += '.a';
  }
  const ast = nunjucks.parser.parse(`{{ ${paramString} }}`, [], {});
  const visitor = new ParameterVisitor({ lookupParameter: 'params' });
  // Act, Assert
  expect(() => walkAst(ast, [visitor])).toThrow('Max depth reached');
});
