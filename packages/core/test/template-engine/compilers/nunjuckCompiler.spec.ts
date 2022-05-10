import { NunjucksCompiler, InMemoryCodeLoader } from '@template-engine/.';
import { NunjucksCompilerExtension } from '@template-engine/compilers/nunjucks/extensions';

it('Nunjucks compiler should compile template without error.', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const compiler = new NunjucksCompiler({ loader });

  // Action
  const compilerCode = compiler.compile('Hello {{ name }}');

  // Assert
  expect(compilerCode).toBeTruthy();
});

it('Nunjucks compiler should load compiled code and render template with it', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const compiler = new NunjucksCompiler({ loader });
  const { compiledData } = compiler.compile('Hello {{ name }}!');

  // Action
  loader.setSource('test', compiledData);
  const result = await compiler.render('test', { name: 'World' });

  // Assert
  expect(result).toBe('Hello World!');
});

it('Nunjucks compiler should reject unsupported extensions', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const compiler = new NunjucksCompiler({ loader });
  // Action, Assert
  // extension should have parse and name property
  expect(() =>
    compiler.loadExtension({ tags: ['test'] } as NunjucksCompilerExtension)
  ).toThrow('Unsupported extension');
});
