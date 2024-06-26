import { TemplateEngine, Compiler } from '@vulcan-sql/core/template-engine';
import * as sinon from 'ts-sinon';
import { TYPES } from '@vulcan-sql/core/types';
import { Container } from 'inversify';
import {
  CodeLoader,
  TemplateProvider,
  TemplateProviderType,
} from '@vulcan-sql/core';

let container: Container;
let stubCompiler: sinon.StubbedInstance<Compiler>;
let stubTemplateProvider: sinon.StubbedInstance<TemplateProvider>;
let stubCodeLoader: sinon.StubbedInstance<CodeLoader>;

beforeEach(() => {
  container = new Container();
  stubCompiler = sinon.stubInterface<Compiler>();
  stubTemplateProvider = sinon.stubInterface<TemplateProvider>();
  stubCodeLoader = sinon.stubInterface<CodeLoader>();

  container.bind(TYPES.Compiler).toConstantValue(stubCompiler);
  container.bind(TYPES.TemplateProvider).toConstantValue(stubTemplateProvider);
  container.bind(TYPES.TemplateEngine).to(TemplateEngine).inSingletonScope();
  container.bind(TYPES.TemplateEngineOptions).toConstantValue({
    provider: TemplateProviderType.LocalFile,
    folderPath: '',
  });
  container.bind(TYPES.CompilerLoader).toConstantValue(stubCodeLoader);

  stubCompiler.name = 'stub-compiler';
  stubCompiler.compile.resolves({
    compiledData: 'compiled-template',
    metadata: {
      parameters: [],
      errors: [],
    },
  });
  stubCompiler.execute.resolves('sql-result' as any);

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
  const parameters = {
    name: 'name',
  };
  const profileName = 'mocked-profile';
  const expected = {
    parameters,
    profileName,
  };

  // Act
  const result = await templateEngine.execute('template-name', {
    parameters,
    profileName,
  });

  // Assert
  expect(stubCompiler.execute.firstCall.args[1]).toEqual(expected);
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
