import { TYPES } from '@vulcan/core/containers';
import {
  ErrorExtension,
  ExecuteExtension,
  Executor,
  InMemoryCodeLoader,
  NunjucksCompiler,
  NunjucksCompilerExtension,
  QueryBuilder,
  ReqExtension,
  UniqueExtension,
} from '@vulcan/core/template-engine';
import { Container } from 'inversify';
import * as sinon from 'ts-sinon';

export const createTestCompiler = () => {
  const container = new Container();
  const stubBuilder = sinon.stubInterface<QueryBuilder>();
  stubBuilder.count.returns(stubBuilder);
  const stubExecutor = sinon.stubInterface<Executor>();
  stubExecutor.createBuilder.resolves(stubBuilder);

  container
    .bind(TYPES.CompilerLoader)
    .to(InMemoryCodeLoader)
    .inSingletonScope();
  container
    .bind<NunjucksCompilerExtension>(TYPES.CompilerExtension)
    .to(UniqueExtension)
    .inSingletonScope();
  container
    .bind<NunjucksCompilerExtension>(TYPES.CompilerExtension)
    .to(ErrorExtension)
    .inSingletonScope();
  container
    .bind<NunjucksCompilerExtension>(TYPES.CompilerExtension)
    .to(ReqExtension)
    .inSingletonScope();
  container
    .bind<NunjucksCompilerExtension>(TYPES.CompilerExtension)
    .to(ExecuteExtension)
    .inSingletonScope();
  container.bind<Executor>(TYPES.Executor).toConstantValue(stubExecutor);

  container.bind(TYPES.Compiler).to(NunjucksCompiler).inSingletonScope();
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
