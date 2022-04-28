import { NunjucksCompiler, InMemoryCodeLoader } from '../../..';

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
  const compilerCode = compiler.compile('Hello {{ name }}!');

  // Action
  loader.setSource('test', compilerCode);
  const result = await compiler.render('test', { name: 'World' });

  // Assert
  expect(result).toBe('Hello World!');
});
