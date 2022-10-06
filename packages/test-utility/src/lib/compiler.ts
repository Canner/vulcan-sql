import * as sinon from 'ts-sinon';
import { Container } from 'inversify';
import {
  BaseCompilerEnvironment,
  BuildTimeCompilerEnvironment,
  extensionModule,
  ICoreOptions,
  IDataQueryBuilder,
  IExecutor,
  InMemoryCodeLoader,
  ITemplateEngineOptions,
  NunjucksCompiler,
  RuntimeCompilerEnvironment,
  TemplateEngineOptions,
  TemplateProviderType,
  TYPES,
  validatorLoaderModule,
} from '@vulcan-sql/core';

export const getTestCompiler = async (config: Partial<ICoreOptions> = {}) => {
  const container = new Container();
  // Builder and executor
  const stubQueryBuilder = sinon.stubInterface<IDataQueryBuilder>();
  const stubExecutor = sinon.stubInterface<IExecutor>();
  stubExecutor.createBuilder.resolves(stubQueryBuilder);
  container.bind<IExecutor>(TYPES.Executor).toConstantValue(stubExecutor);

  // Code loader
  container
    .bind(TYPES.CompilerLoader)
    .to(InMemoryCodeLoader)
    .inSingletonScope();

  // Extension
  await container.loadAsync(extensionModule(config as any));
  // Validators
  await container.loadAsync(validatorLoaderModule());

  // Compiler
  container.bind(TYPES.Compiler).to(NunjucksCompiler).inSingletonScope();

  // Compiler environment
  container
    .bind<BaseCompilerEnvironment>(TYPES.CompilerEnvironment)
    .toDynamicValue((context) => {
      return new RuntimeCompilerEnvironment(
        context.container.get(TYPES.CompilerLoader),
        context.container.getAll(TYPES.Extension_TemplateEngine),
        context.container.get(TYPES.ValidatorLoader)
      );
    })
    .inSingletonScope()
    .whenTargetNamed('runtime');

  container
    .bind<BaseCompilerEnvironment>(TYPES.CompilerEnvironment)
    .toDynamicValue((context) => {
      return new BuildTimeCompilerEnvironment(
        context.container.getAll(TYPES.Extension_TemplateEngine),
        context.container.get(TYPES.ValidatorLoader)
      );
    })
    .inSingletonScope()
    .whenTargetNamed('compileTime');

  // Options
  container
    .bind<ITemplateEngineOptions>(TYPES.TemplateEngineInputOptions)
    .toConstantValue({
      folderPath: '',
      provider: TemplateProviderType.LocalFile,
    });
  container
    .bind<ITemplateEngineOptions>(TYPES.TemplateEngineOptions)
    .to(TemplateEngineOptions)
    .inSingletonScope();

  const compiler = container.get<NunjucksCompiler>(TYPES.Compiler);
  const loader = container.get<InMemoryCodeLoader>(TYPES.CompilerLoader);
  return {
    builder: stubQueryBuilder,
    executor: stubExecutor,
    compiler,
    loader,
    compileAndLoad: async (template: string) => {
      const { compiledData, metadata } = await compiler.compile(template);
      loader.setSource('test', compiledData);
      return { compiledData, metadata };
    },
    execute: async (parameters: any) => {
      return await compiler.execute('test', {
        parameters,
        profileName: 'mocked-profile',
      });
    },
    getExecutedQueries: async () => {
      const calls = stubExecutor.createBuilder.getCalls();
      return calls.map((call) => call.args[1]);
    },
  };
};
