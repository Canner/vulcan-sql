import { TYPES } from '@vulcan-sql/core/types';
import {
  BaseCompilerEnvironment,
  BuildTimeCompilerEnvironment,
  InMemoryCodeLoader,
  NunjucksCompiler,
  RuntimeCompilerEnvironment,
} from '@vulcan-sql/core/template-engine';
import { Container } from 'inversify';
import * as sinon from 'ts-sinon';
import { IDataQueryBuilder, IExecutor } from '@vulcan-sql/core/data-query';
import { extensionModule } from '../../src/containers/modules';
import { ICoreOptions } from '@vulcan-sql/core';
import { DeepPartial } from 'ts-essentials';

export const createTestCompiler = async ({
  options = {},
}: {
  options?: DeepPartial<ICoreOptions>;
} = {}) => {
  const container = new Container();
  const stubQueryBuilder = sinon.stubInterface<IDataQueryBuilder>();
  stubQueryBuilder.count.returns(stubQueryBuilder);
  const stubExecutor = sinon.stubInterface<IExecutor>();
  stubExecutor.createBuilder.resolves(stubQueryBuilder);
  stubExecutor.prepare.callsFake(
    async ({ parameterIndex }) => `$${parameterIndex}`
  );

  container
    .bind(TYPES.CompilerLoader)
    .to(InMemoryCodeLoader)
    .inSingletonScope();
  container.bind<IExecutor>(TYPES.Executor).toConstantValue(stubExecutor);
  container.bind(TYPES.Compiler).to(NunjucksCompiler).inSingletonScope();

  await container.loadAsync(extensionModule(options as any));

  // Compiler environment
  container
    .bind<BaseCompilerEnvironment>(TYPES.CompilerEnvironment)
    .toDynamicValue((context) => {
      return new RuntimeCompilerEnvironment(
        context.container.get(TYPES.CompilerLoader),
        context.container.getAll(TYPES.Extension_TemplateEngine)
      );
    })
    .inSingletonScope()
    .whenTargetNamed('runtime');

  container
    .bind<BaseCompilerEnvironment>(TYPES.CompilerEnvironment)
    .toDynamicValue((context) => {
      return new BuildTimeCompilerEnvironment(
        context.container.getAll(TYPES.Extension_TemplateEngine)
      );
    })
    .inSingletonScope()
    .whenTargetNamed('compileTime');

  return {
    builder: stubQueryBuilder,
    executor: stubExecutor,
    compiler: container.get<NunjucksCompiler>(TYPES.Compiler),
    loader: container.get<InMemoryCodeLoader>(TYPES.CompilerLoader),
    executeTemplate: async (
      name: string,
      parameters: any = {},
      profileName = 'mocked-profile'
    ) => {
      return container
        .get<NunjucksCompiler>(TYPES.Compiler)
        .execute(name, { parameters, profileName });
    },
    getCreatedProfiles: async () => {
      const calls = stubExecutor.createBuilder.getCalls();
      return calls.map((call) => call.args[0]);
    },
    getCreatedQueries: async () => {
      const calls = stubExecutor.createBuilder.getCalls();
      return calls.map((call) => call.args[1]);
    },
    getCreatedBinding: async () => {
      const calls = stubExecutor.createBuilder.getCalls();
      return calls.map((call) => call.args[2]);
    },
  };
};
