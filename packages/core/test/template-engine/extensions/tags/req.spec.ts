import {
  NunjucksCompiler,
  InMemoryCodeLoader,
  Executor,
  ReqExtension,
} from '@template-engine';
import * as sinon from 'ts-sinon';

it('req extension should execute correct query and set variable', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const mockExecutor = sinon.stubInterface<Executor>();
  const compiler = new NunjucksCompiler({
    loader,
    extensions: [new ReqExtension({ executor: mockExecutor })],
  });
  const { compiledData } = compiler.compile(`
{% req userCount %}
select count(*) as count from user where user.id = '{{ params.userId }}';
{% endreq %}
{{ userCount[0].count }}
  `);
  mockExecutor.executeQuery.resolves([{ count: 1 }]);

  // Action
  loader.setSource('test', compiledData);
  const query = await compiler.render('test', {
    params: { userId: 'user-id' },
  });
  // Assert
  expect(mockExecutor.executeQuery.firstCall.args[0]).toBe(
    `select count(*) as count from user where user.id = 'user-id';`
  );
  expect(query).toBe('1');
});

it('if argument is not a symbol, extension should throw', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const mockExecutor = sinon.stubInterface<Executor>();
  const compiler = new NunjucksCompiler({
    loader,
    extensions: [new ReqExtension({ executor: mockExecutor })],
  });

  // Action, Assert
  expect(() =>
    compiler.compile(`
{% req "userCount" %}
select count(*) as count from user where user.id = '{{ params.userId }}';
{% endreq %}
  `)
  ).toThrow(`Expected a symbol, but got Literal`);
});

it('if argument is missing, extension should throw', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const mockExecutor = sinon.stubInterface<Executor>();
  const compiler = new NunjucksCompiler({
    loader,
    extensions: [new ReqExtension({ executor: mockExecutor })],
  });

  // Action, Assert
  expect(() =>
    compiler.compile(`
{% req %}
select count(*) as count from user where user.id = '{{ params.userId }}';
{% endreq %}
  `)
  ).toThrow(`Expected a variable`);
});
