import { visitChildren, walkAst } from '@vulcan-sql/api-layer/template-engine';
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
  walkAst(root, [() => visitedNodes++]);
  // Assert
  expect(visitedNodes).toBe(5);
});

it('AST visit children function should visit all the child node of NodeList', async () => {
  // Arrange
  const root = new nunjucks.nodes.NodeList(0, 0);
  root.addChild(
    new nunjucks.nodes.CallExtension( // 1
      {},
      'run',
      new nunjucks.nodes.NodeList(0, 0),
      [new nunjucks.nodes.Literal(0, 0, 'a')]
    )
  );
  root.addChild(new nunjucks.nodes.Literal(0, 0, 'b')); // 2
  let visitedNodes = 0;
  // Act
  visitChildren(root, () => visitedNodes++);
  // Assert
  expect(visitedNodes).toBe(2);
});

it('AST visit children function should visit all the child node of CallExtension', async () => {
  // Arrange
  const root = new nunjucks.nodes.CallExtensionAsync(
    'test',
    'run',
    new nunjucks.nodes.NodeList(0, 0) /* 1 */,
    [new nunjucks.nodes.Literal(0, 0, 'a') /* 2 */]
  );

  let visitedNodes = 0;
  // Act
  visitChildren(root, () => visitedNodes++);
  // Assert
  expect(visitedNodes).toBe(2);
});

it('AST visit children function should visit all the child node of LookupVal', async () => {
  // Arrange
  const root = new nunjucks.nodes.LookupVal(
    0,
    0,
    new nunjucks.nodes.Symbol(0, 0, 'a') /* 1 */
  );

  let visitedNodes = 0;
  // Act
  visitChildren(root, () => visitedNodes++);
  // Assert
  expect(visitedNodes).toBe(1);
});

it('AST replace function should work with NodeList', async () => {
  // Arrange
  const root = new nunjucks.nodes.NodeList(0, 0);
  root.addChild(
    new nunjucks.nodes.CallExtension( // 1
      {},
      'run',
      new nunjucks.nodes.NodeList(0, 0),
      [new nunjucks.nodes.Literal(0, 0, 'a')]
    )
  );
  root.addChild(new nunjucks.nodes.Literal(0, 0, 'b')); // 2
  root.addChild(new nunjucks.nodes.Symbol(0, 0, 'c')); // 3
  let visitedNodes = 0;
  // Act
  visitChildren(root, (_node, replace) => {
    if (visitedNodes === 0) {
      // Replace the first node
      replace(new nunjucks.nodes.Literal(0, 0, 'c'));
    } else if (visitedNodes === 1) {
      // Delete the second node
      replace(null);
    } else {
      // Replace the third node
      replace(new nunjucks.nodes.Literal(0, 0, 'd'));
    }
    visitedNodes++;
  });
  // Assert
  expect(root.children[0] instanceof nunjucks.nodes.Literal).toBe(true);
  expect(root.children[1] instanceof nunjucks.nodes.Literal).toBe(true);
  expect(root.children.length).toBe(2);
});

it('AST replace function should work with CallExtension', async () => {
  // Arrange
  const root = new nunjucks.nodes.CallExtensionAsync(
    'test',
    'run',
    new nunjucks.nodes.NodeList(0, 0) /* 1 */,
    [
      new nunjucks.nodes.Literal(0, 0, 'a') /* 2 */,
      new nunjucks.nodes.Literal(0, 0, 'b') /* 3 */,
      new nunjucks.nodes.Literal(0, 0, 'c') /* 4 */,
    ]
  );
  let visitedNodes = 0;
  // Act
  visitChildren(root, (_node, replace) => {
    if (visitedNodes === 0) {
      // Replace the first node
      replace(new nunjucks.nodes.NodeList(0, 1));
    } else if (visitedNodes === 1) {
      // Replace the second node
      replace(new nunjucks.nodes.Symbol(0, 0, 'a-r'));
    } else if (visitedNodes === 2) {
      // Delete the third node
      replace(null);
    }
    visitedNodes++;
  });
  // Assert
  expect(root.args.colno).toBe(1);
  expect(root.contentArgs?.[0] instanceof nunjucks.nodes.Symbol).toBe(true);
  expect(root.contentArgs?.[1] instanceof nunjucks.nodes.Literal).toBe(true);
  expect(root.contentArgs?.length).toBe(2);
});

it('AST replace function should provide fallback for CallExtension if we trying to delete args node', async () => {
  // Arrange
  const args = new nunjucks.nodes.NodeList(1, 1);
  args.addChild(new nunjucks.nodes.Literal(0, 0, 'a'));
  const root = new nunjucks.nodes.CallExtensionAsync('test', 'run', args, []);
  // Act
  visitChildren(root, (node, replace) => {
    if (node instanceof nunjucks.nodes.NodeList) {
      replace(null);
    }
  });
  // Assert
  expect(root.args.lineno).toBe(1);
  expect(root.args.colno).toBe(1);
  expect(root.args.children.length).toBe(0);
});

it('AST replace function should wrap the result for CallExtension if we trying to replace args with nodes other than NodeList', async () => {
  // Arrange
  const root = new nunjucks.nodes.CallExtensionAsync(
    'test',
    'run',
    new nunjucks.nodes.NodeList(1, 1),
    []
  );
  // Act
  visitChildren(root, (node, replace) => {
    if (node instanceof nunjucks.nodes.NodeList) {
      replace(new nunjucks.nodes.Literal(0, 0, 'a'));
    }
  });
  // Assert
  expect(root.args.lineno).toBe(1);
  expect(root.args.colno).toBe(1);
  expect(root.args.children[0] instanceof nunjucks.nodes.Literal).toBe(true);
});

it('AST replace function should work with LookupVal', async () => {
  // Arrange
  const root = new nunjucks.nodes.LookupVal(
    0,
    0,
    new nunjucks.nodes.Literal(0, 0, 'a') /* target 1 */,
    new nunjucks.nodes.Value(0, 0, 'b') /* value  2 */
  );
  let visitedNodes = 0;
  // Act
  visitChildren(root, (_node, replace) => {
    if (visitedNodes === 0) {
      // Replace the first node
      replace(new nunjucks.nodes.Symbol(0, 0, 'c'));
    } else if (visitedNodes === 1) {
      // Delete the second node
      replace(null);
    }
    visitedNodes++;
  });
  // Assert
  expect(root.target instanceof nunjucks.nodes.Symbol).toBe(true);
  expect(root.val).toBeUndefined();
});
