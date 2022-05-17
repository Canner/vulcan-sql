import { TemplateEngine, Compiler, TemplateProvider } from '@template-engine';
import * as sinon from 'ts-sinon';
import { TYPES } from '@containers';
import { Container } from 'inversify';

let container: Container;
let stubCompiler: sinon.StubbedInstance<Compiler>;
let stubTemplateProvider: sinon.StubbedInstance<TemplateProvider>;

beforeEach(() => {
  container = new Container();
  stubCompiler = sinon.stubInterface<Compiler>();
  stubTemplateProvider = sinon.stubInterface<TemplateProvider>();

  container.bind(TYPES.Compiler).toConstantValue(stubCompiler);
  container
    .bind(TYPES.Factory_TemplateProvider)
    .toConstantValue(() => stubTemplateProvider);
  container.bind(TYPES.TemplateEngine).to(TemplateEngine).inSingletonScope();
  container.bind(TYPES.TemplateEngineOptions).toConstantValue({});

  stubCompiler.name = 'stub-compiler';
  stubCompiler.compile.returns({
    compiledData: 'compiled-template',
    metadata: {
      parameters: [],
      errors: [],
    },
  });
  stubCompiler.render.resolves('sql-statement');

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
  const result = await templateEngine.render('template-name', context);

  // Assert
  expect(stubCompiler.render.calledWith('template-name', context)).toBe(true);
  expect(result).toBe('sql-statement');
});
