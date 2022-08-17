import * as sinon from 'ts-sinon';
import * as nunjucks from 'nunjucks';
import { Container } from 'inversify';
import {
  extensionModule,
  ICoreOptions,
  IDataQueryBuilder,
  IExecutor,
  InMemoryCodeLoader,
  ITemplateEngineOptions,
  NunjucksCompiler,
  TemplateEngineOptions,
  TemplateProviderType,
  TYPES,
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

  // Compiler
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
    execute: async (data: any) => {
      return await compiler.execute('test', data);
    },
    getExecutedQueries: async () => {
      const calls = stubExecutor.createBuilder.getCalls();
      return calls.map((call) => call.args[0]);
    },
  };
};
