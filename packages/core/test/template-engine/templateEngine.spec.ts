import {
  TemplateEngine,
  Compiler,
  TemplateProvider,
  ICodeLoader,
} from '@vulcan-sql/core/template-engine';
import * as sinon from 'ts-sinon';
import { TYPES } from '@vulcan-sql/core/types';
import { Container } from 'inversify';

let container: Container;
let stubCompiler: sinon.StubbedInstance<Compiler>;
let stubTemplateProvider: sinon.StubbedInstance<TemplateProvider>;
let stubCodeLoader: sinon.StubbedInstance<ICodeLoader>;

beforeEach(() => {
  container = new Container();
  stubCompiler = sinon.stubInterface<Compiler>();
  stubTemplateProvider = sinon.stubInterface<TemplateProvider>();
  stubCodeLoader = sinon.stubInterface<ICodeLoader>();

  container.bind(TYPES.Compiler).toConstantValue(stubCompiler);
  container
    .bind(TYPES.Factory_TemplateProvider)
    .toConstantValue(() => stubTemplateProvider);
  container.bind(TYPES.TemplateEngine).to(TemplateEngine).inSingletonScope();
  container.bind(TYPES.TemplateEngineOptions).toConstantValue({});
  container.bind(TYPES.CompilerLoader).toConstantValue(stubCodeLoader);

  stubCompiler.name = 'stub-compiler';
  stubCompiler.compile.resolves({
    compiledData: 'compiled-template',
    metadata: {
      parameters: [],
      errors: [],
    },
  });
  stubCompiler.execute.resolves('sql-result');

  const generator = async function* () {
    yield {
      name: 'template-name',
      statement: 'template-statement',
    };
  };
  stubTemplateProvider.getTemplates.returns(generator());
});

afterEach(() => {
  container.unbindAll();
});

it('Template engine compile function should wrap correct result', async () => {
  // Assert
  const templateEngine = container.get<TemplateEngine>(TYPES.TemplateEngine);

  // Act
  const result = await templateEngine.compile();

  // Assert
  expect(stubCompiler.compile.calledWith('template-statement')).toBe(true);
  expect(result).toEqual({
    templates: {
      'template-name': 'compiled-template',
    },
    metadata: {
      'template-name': {
        parameters: [],
        errors: [],
      },
    },
  });
});

it('Template engine render function should forward correct data to compiler', async () => {
  // Assert
  const templateEngine = container.get<TemplateEngine>(TYPES.TemplateEngine);
  const context = {
    name: 'name',
  };

  // Act
  const result = await templateEngine.execute('template-name', context);

  // Assert
  expect(stubCompiler.execute.calledWith('template-name', context)).toBe(true);
  expect(result).toBe('sql-result');
});

it('Template engine should load the compiled code after compiling', async () => {
  // Assert
  const templateEngine = container.get<TemplateEngine>(TYPES.TemplateEngine);

  // Act
  await templateEngine.compile();

  // Assert
  expect(stubCodeLoader.setSource.calledOnce).toBe(true);
});
