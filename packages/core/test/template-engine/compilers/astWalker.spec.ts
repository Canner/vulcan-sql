import { walkAst } from '@template-engine/compilers/nunjucks/astWalker';
import * as nunjucks from 'nunjucks';

it('AST walker should traversal all nodes', async () => {
  // Arrange
  const root = new nunjucks.nodes.NodeList(0, 0); // 1
  root.addChild(
    new nunjucks.nodes.CallExtension( // 2
      {},
      'run',
      new nunjucks.nodes.NodeList(0, 0), // 3
      [new nunjucks.nodes.Literal(0, 0, 'a') /* 4 */]
    )
  );
  root.addChild(new nunjucks.nodes.Literal(0, 0, 'b')); // 5
  let visitedNodes = 0;
  // Act
  walkAst(root, [
    {
      visit: () => visitedNodes++,
    },
  ]);
  // Assert
  expect(visitedNodes).toBe(5);
});
