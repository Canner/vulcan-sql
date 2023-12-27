import { TYPES } from '@vulcan-sql/api-layer/types';
import {
  CodeLoader,
  ITemplateEngineOptions,
  TemplateProvider,
} from '@vulcan-sql/api-layer/models';
import {
  NunjucksCompiler,
  Compiler,
  TemplateEngine,
  BaseCompilerEnvironment,
  RuntimeCompilerEnvironment,
  BuildTimeCompilerEnvironment,
} from '@vulcan-sql/api-layer/template-engine';
import { AsyncContainerModule, interfaces } from 'inversify';
import { TemplateEngineOptions } from '../../options';

export const templateEngineModule = (options: ITemplateEngineOptions = {}) =>
  new AsyncContainerModule(async (bind) => {
    // Options
    bind<ITemplateEngineOptions>(
      TYPES.TemplateEngineInputOptions
    ).toConstantValue(options);
    bind<ITemplateEngineOptions>(TYPES.TemplateEngineOptions)
      .to(TemplateEngineOptions)
      .inSingletonScope();

    // TemplateProvider
    bind<interfaces.AutoNamedFactory<TemplateProvider>>(
      TYPES.Factory_TemplateProvider
    ).toAutoNamedFactory<TemplateProvider>(TYPES.Extension_TemplateProvider);

    if (options.provider) {
      // Template provider is an optional component, but we can't use templateEngine.compile() if provider wasn't bound.
      bind<TemplateProvider>(TYPES.TemplateProvider)
        .toDynamicValue((context) => {
          const factory = context.container.get<
            interfaces.AutoNamedFactory<TemplateProvider>
          >(TYPES.Factory_TemplateProvider);
          return factory(options.provider!);
        })
        .inSingletonScope();
    }

    // Compiler environment, we need to initialize them manually because they extends some old js libraries.
    bind<BaseCompilerEnvironment>(TYPES.CompilerEnvironment)
      .toDynamicValue((context) => {
        return new RuntimeCompilerEnvironment(
          context.container.get(TYPES.CompilerLoader),
          context.container.getAll(TYPES.Extension_TemplateEngine),
          context.container.get(TYPES.ValidatorLoader)
        );
      })
      .inSingletonScope()
      .whenTargetNamed('runtime');

    bind<BaseCompilerEnvironment>(TYPES.CompilerEnvironment)
      .toDynamicValue((context) => {
        return new BuildTimeCompilerEnvironment(
          context.container.getAll(TYPES.Extension_TemplateEngine),
          context.container.get(TYPES.ValidatorLoader)
        );
      })
      .inSingletonScope()
      .whenTargetNamed('compileTime');

    // Loader
    bind<interfaces.AutoNamedFactory<CodeLoader>>(
      TYPES.Factory_CompilerLoader
    ).toAutoNamedFactory(TYPES.Extension_CompilerLoader);
    bind<CodeLoader>(TYPES.CompilerLoader)
      .toDynamicValue((context) => {
        const loaderFactory = context.container.get<
          interfaces.AutoNamedFactory<CodeLoader>
        >(TYPES.Factory_CompilerLoader);
        const options = context.container.get<TemplateEngineOptions>(
          TYPES.TemplateEngineOptions
        );
        return loaderFactory(options.codeLoader);
      })
      .inSingletonScope();

    // Compiler
    bind<Compiler>(TYPES.Compiler).to(NunjucksCompiler).inSingletonScope();

    // Template Engine
    bind<TemplateEngine>(TYPES.TemplateEngine)
      .to(TemplateEngine)
      .inSingletonScope();
  });
