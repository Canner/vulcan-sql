import { TYPES } from '@vulcan/core/containers';
import {
  NunjucksCompiler,
  InMemoryCodeLoader,
  Executor,
  ReqExtension,
  Compiler,
  QueryBuilder,
  ExecuteExtension,
} from '@vulcan/core/template-engine';
import { Container } from 'inversify';
import * as sinon from 'ts-sinon';

let container: Container;
let mockExecutor: sinon.StubbedInstance<Executor>;
let mockBuilder: sinon.StubbedInstance<QueryBuilder>;

beforeEach(() => {
  container = new Container();
  mockBuilder = sinon.stubInterface<QueryBuilder>();
  mockBuilder.count.returns(mockBuilder);
  mockExecutor = sinon.stubInterface<Executor>();
  mockExecutor.createBuilder.resolves(mockBuilder);
  container
    .bind(TYPES.CompilerLoader)
    .to(InMemoryCodeLoader)
    .inSingletonScope();
  container.bind(TYPES.Executor).toConstantValue(mockExecutor);
  container.bind(TYPES.Compiler).to(NunjucksCompiler).inSingletonScope();
  container.bind(TYPES.CompilerExtension).to(ReqExtension).inSingletonScope();
  container
    .bind(TYPES.CompilerExtension)
    .to(ExecuteExtension)
    .inSingletonScope();
});

afterEach(() => {
  container.unbindAll();
});

it('query builder should be executes when .value() function called', async () => {
  // Arrange
  const compiler = container.get<Compiler>(TYPES.Compiler);
  const loader = container.get<InMemoryCodeLoader>(TYPES.CompilerLoader);
  const { compiledData } = compiler.compile(`
{% req user %}
select * from public.users limit 1 where id = '{{ params.userId }}';
{% endreq %}

{% if user.count().value() == 1 %}
Existed
{% else %}
Not existed
{% endif %}

  `);
  mockBuilder.value.resolves(1);
  // Action
  loader.setSource('test', compiledData);
  const query = await compiler.render('test', {
    params: { userId: 'user-id' },
  });
  // Assert
  expect(mockExecutor.createBuilder.firstCall.args[0]).toBe(
    `select * from public.users limit 1 where id = 'user-id';`
  );
  expect(mockBuilder.count.calledOnce).toBe(true);
  expect(query).toBe('Existed');
});
