import * as nunjucks from 'nunjucks';
import { walkAst } from '@template-engine/compilers/nunjucks/astWalker';
import { ErrorExtension } from '@template-engine/compilers/nunjucks/extensions';
import { ErrorsVisitor } from '@template-engine/compilers/nunjucks/visitors';

it('Visitor should return correct error list', async () => {
  // Arrange
  const env = new nunjucks.Environment();
  const ext = new ErrorExtension();
  env.addExtension(ext.name, ext);
  const ast = nunjucks.parser.parse(
    `
{% error "ERROR_CODE" %}
{% error "ERROR_CODE_2" %}
{% error "ERROR_CODE_2" %}
  `,
    env.extensionsList,
    {}
  );
  const visitor = new ErrorsVisitor({ extensionName: ext.name });
  // Act
  walkAst(ast, [visitor]);
  const errors = visitor.getErrors();
  // Assert
  expect(errors.length).toBe(2);
  expect(errors).toContainEqual({
    code: 'ERROR_CODE',
    locations: [
      {
        lineNo: 1,
        columnNo: 9,
      },
    ],
  });
  expect(errors).toContainEqual({
    code: 'ERROR_CODE_2',
    locations: [
      {
        lineNo: 2,
        columnNo: 9,
      },
      {
        lineNo: 3,
        columnNo: 9,
      },
    ],
  });
});

it('Visitor should ignore the extension calls which are not belong to error extension', async () => {
  // Arrange
  const ast = new nunjucks.nodes.CallExtension(
    { __name: 'other-ext' },
    'run',
    new nunjucks.nodes.NodeList(0, 0),
    [new nunjucks.nodes.Literal(0, 0, 'a')]
  );
  const visitor = new ErrorsVisitor({ extensionName: 'error-extension' });
  // Act
  walkAst(ast, [visitor]);
  const errors = visitor.getErrors();
  // Assert
  expect(errors.length).toBe(0);
});

it('If the arguments of the extension are not the same as expected, visitor should throw error', async () => {
  // Arrange
  const args = new nunjucks.nodes.NodeList(0, 0);
  args.addChild(new nunjucks.nodes.Symbol(0, 0, 'a')); // Should be a literal

  const ast = new nunjucks.nodes.CallExtension(
    { __name: 'error-extension' },
    'run',
    args,
    []
  );
  const visitor = new ErrorsVisitor({ extensionName: 'error-extension' });
  // Act, Assert
  expect(() => walkAst(ast, [visitor])).toThrow(`Expected literal, got Symbol`);
});
