import {
  Executor,
  MainBuilderVisitor,
  NunjucksTagExtensionWrapper,
  ReqExtension,
  walkAst,
} from '@vulcan/core/template-engine';
import * as nunjucks from 'nunjucks';
import * as sinon from 'ts-sinon';

let extensions: nunjucks.Extension[] = [];

beforeEach(() => {
  const mockExecutor = sinon.stubInterface<Executor>();
  const { transform: reqExtension } = NunjucksTagExtensionWrapper(
    new ReqExtension(mockExecutor)
  );
  extensions = [reqExtension];
});

it('Should do nothing if there is exactly one main builder', async () => {
  // Arrange
  const ast = nunjucks.parser.parse(
    `some output {% req user main %} select * from users; {% endreq %}`,
    extensions,
    {}
  );
  const visitor = new MainBuilderVisitor();
  // Act
  walkAst(ast, [visitor]);
  // Arrange
  expect(ast.children.length).toBe(2);
});

it('Should throw an error if there are tow main builders', async () => {
  // Arrange
  const ast = nunjucks.parser.parse(
    `
    {% req user main %} select * from users; {% endreq %}
    {% req user2 main %} select * from users; {% endreq %}
    `,
    extensions,
    {}
  );
  const visitor = new MainBuilderVisitor();
  // Act, Arrange
  expect(() => walkAst(ast, [visitor])).toThrowError(
    `Only one main builder is allowed.`
  );
});

it('Should wrap the output in a builder if there is no main builder', async () => {
  // Arrange
  const ast = nunjucks.parser.parse(
    `
select * from users
where id = {{ params.id }};
    `,
    extensions,
    {}
  );
  const visitor = new MainBuilderVisitor();
  // Act
  walkAst(ast, [visitor]);
  // Arrange
  expect(ast.children.length).toBe(1);
  expect(ast.children[0] instanceof nunjucks.nodes.CallExtensionAsync).toBe(
    true
  );
  expect((ast.children[0] as any).args.children[1].value).toBe('true'); // main builder notation
});

it('Should throw an error if there is no root node', async () => {
  // Arrange
  const ast = nunjucks.parser.parse(
    `
select * from users
where id = {{ params.id }};
    `,
    extensions,
    {}
  );
  const visitor = new MainBuilderVisitor();
  // Act, Arrange
  walkAst(ast.children[0], [visitor]); // We start visiting the children of the root node, skipping the root node itself
  expect(() => visitor.finish()).toThrow('No root node found.');
});
