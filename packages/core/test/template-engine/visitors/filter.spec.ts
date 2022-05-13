import * as nunjucks from 'nunjucks';
import { walkAst, FiltersVisitor } from '@template-engine';

it('If we try to use an unloaded filter, visitor should throw error', async () => {
  // Arrange
  const env = new nunjucks.Environment();
  env.addFilter('test', (val) => val);
  const ast = nunjucks.parser.parse(`{{ 123 | unloadedFilter }}`, [], {});
  const visitor = new FiltersVisitor({ env });
  // Act, Assert
  expect(() => walkAst(ast, [visitor])).toThrow(
    'filter not found: unloadedFilter'
  );
});

it('If we try to use loaded filter, visitor should do nothing', async () => {
  // Arrange
  const env = new nunjucks.Environment();
  env.addFilter('test', (val) => val);
  const ast = nunjucks.parser.parse(`{{ 123 | test }}`, [], {});
  const visitor = new FiltersVisitor({ env });
  // Act, Assert
  expect(() => walkAst(ast, [visitor])).not.toThrow();
});

it('If we try to visit an unexpected filter node, visitor should do nothing', async () => {
  // Arrange
  const root = new nunjucks.nodes.Filter(
    0,
    0,
    'test',
    new nunjucks.nodes.LookupVal(0, 0, 'a'), // Should be a Symbol or Literal
    new nunjucks.nodes.NodeList(0, 0, [])
  );
  const env = new nunjucks.Environment();
  const visitor = new FiltersVisitor({ env });
  // Act, Assert
  expect(() => walkAst(root, [visitor])).not.toThrow();
});
