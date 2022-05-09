import * as nunjucks from 'nunjucks';
import { walkAst } from '../../../../src/lib/template-engine/compilers/nunjucks/astWalker';
import { ErrorExtension } from '../../../../src/lib/template-engine/compilers/nunjucks/extensions';
import { ErrorsVisitor } from '../../../../src/lib/template-engine/compilers/nunjucks/visitors';

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
