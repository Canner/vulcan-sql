import { BuilderValueVisitor, walkAst } from '@vulcan/core/template-engine';
import * as nunjucks from 'nunjucks';

it('Should throw an error if max depth exceeded (100)', async () => {
  // Arrange
  let queryString = '{{ something.a';
  for (let i = 0; i < 101; i++) {
    queryString += '.a';
  }
  queryString += '.value() }}';
  const ast = nunjucks.parser.parse(queryString, [], {});
  const visitor = new BuilderValueVisitor();
  // Act, Arrange

  expect(() => walkAst(ast, [visitor])).toThrow('Max depth reached');
});
