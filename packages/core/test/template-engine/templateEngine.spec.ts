import {
  TemplateEngine,
  Compiler,
  TemplateProvider,
  FileTemplateProvider,
} from '@template-engine/.';
import * as sinon from 'ts-sinon';
import * as path from 'path';

it('Template engine compile function should wrap correct result', async () => {
  // Assert
  const stubCompiler = sinon.stubInterface<Compiler>();
  stubCompiler.name = 'stub-compiler';
  stubCompiler.compile.returns('compiled-template');
  const stubTemplateProvider = sinon.stubInterface<TemplateProvider>();
  const generator = async function* () {
    yield {
      name: 'template-name',
      statement: 'template-statement',
    };
  };
  stubTemplateProvider.getTemplates.returns(generator());
  const templateEngine = new TemplateEngine({
    compiler: stubCompiler,
    templateProvider: stubTemplateProvider,
  });

  // Act
  const result = await templateEngine.compile();

  // Assert
  expect(stubCompiler.compile.calledWith('template-statement')).toBe(true);
  expect(result).toEqual({
    templates: {
      'template-name': 'compiled-template',
    },
  });
});

it('Template engine render function should forward correct data to compiler', async () => {
  // Assert
  const stubCompiler = sinon.stubInterface<Compiler>();
  stubCompiler.render.resolves('sql-statement');
  const templateEngine = new TemplateEngine({ compiler: stubCompiler });
  const context = {
    name: 'name',
  };

  // Act
  const result = await templateEngine.render('template-name', context);

  // Assert
  expect(stubCompiler.render.calledWith('template-name', context)).toBe(true);
  expect(result).toBe('sql-statement');
});

it('Template engine useDefaultLoader function should return a fully functional instance', async () => {
  // Assert
  const templateProvider = new FileTemplateProvider({
    folderPath: path.resolve(__dirname, './test-templates'),
  });
  const templateEngine = TemplateEngine.useDefaultLoader({ templateProvider });
  const compiledResult = await templateEngine.compile();

  // Act
  const defaultTemplateEngine = TemplateEngine.useDefaultLoader({
    compiledResult,
  });
  const userStatement = await defaultTemplateEngine.render('user', {
    id: 1,
  });

  // Assert
  expect(userStatement).toBe('select * from public.user where id = 1');
});

it('Should throw error when compiling without template provider', async () => {
  // Assert
  const templateEngine = TemplateEngine.useDefaultLoader();
  // Act, Assert
  await expect(templateEngine.compile()).rejects.toThrow(
    'Template provider is not set'
  );
});
