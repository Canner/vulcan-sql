import { NunjucksCompilerExtension } from '@vulcan/core/template-engine';
import { createTestCompiler } from './testCompiler';

it('Nunjucks compiler should compile template without error.', async () => {
  // Arrange
  const { compiler } = createTestCompiler();

  // Action
  const compilerCode = compiler.compile('Hello {{ name }}');

  // Assert
  expect(compilerCode).toBeTruthy();
});

it('Nunjucks compiler should load compiled code and execute rendered template with it', async () => {
  // Arrange
  const { compiler, loader, getCreatedQueries } = createTestCompiler();
  const { compiledData } = compiler.compile('Hello {{ name }}!');

  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', { name: 'World' });
  const queries = await getCreatedQueries();

  // Assert
  expect(queries[0]).toBe('Hello World!');
});

it('Nunjucks compiler should reject unsupported extensions', async () => {
  // Arrange
  const { compiler } = createTestCompiler();
  // Action, Assert
  // extension should have parse and name property
  expect(() =>
    compiler.loadExtension({ tags: ['test'] } as NunjucksCompilerExtension)
  ).toThrow('Unsupported extension');
});
