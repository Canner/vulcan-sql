import { TYPES } from '@vulcan/core/containers';
import {
  InMemoryCodeLoader,
  NunjucksCompiler,
} from '@vulcan/core/template-engine';
import { bindExtensions } from '@vulcan/core/template-engine/extension-loader';
import { Container } from 'inversify';
import * as sinon from 'ts-sinon';
import * as nunjucks from 'nunjucks';
// TODO: Should replace with a real implementation
import {
  QueryBuilder,
  Executor,
} from '@vulcan/core/template-engine/built-in-extensions/query-builder/reqTagRunner';

export const createTestCompiler = async () => {
  const container = new Container();
  const stubBuilder = sinon.stubInterface<QueryBuilder>();
  stubBuilder.count.returns(stubBuilder);
  const stubExecutor = sinon.stubInterface<Executor>();
  stubExecutor.createBuilder.resolves(stubBuilder);

  container
    .bind(TYPES.CompilerLoader)
    .to(InMemoryCodeLoader)
    .inSingletonScope();
  await bindExtensions(container.bind.bind(container));
  container.bind<Executor>(TYPES.Executor).toConstantValue(stubExecutor);

  container.bind(TYPES.Compiler).to(NunjucksCompiler).inSingletonScope();

  // Compiler environment
  container
    .bind<nunjucks.Environment>(TYPES.CompilerEnvironment)
    .toDynamicValue((context) => {
      // We only need loader in runtime
      const loader = context.container.get<nunjucks.ILoader>(
        TYPES.CompilerLoader
      );
      return new nunjucks.Environment(loader);
    })
    .inSingletonScope()
    .whenTargetNamed('runtime');
  container
    .bind<nunjucks.Environment>(TYPES.CompilerEnvironment)
    .toDynamicValue(() => {
      return new nunjucks.Environment();
    })
    .inSingletonScope()
    .whenTargetNamed('compileTime');

  return {
    builder: stubBuilder,
    executor: stubExecutor,
    compiler: container.get<NunjucksCompiler>(TYPES.Compiler),
    loader: container.get<InMemoryCodeLoader>(TYPES.CompilerLoader),
    getCreatedQueries: async () => {
      const calls = stubExecutor.createBuilder.getCalls();
      return calls.map((call) => call.args[0]);
    },
  };
};
