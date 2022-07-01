import { createTestCompiler } from './testCompiler';

it('Nunjucks compiler should compile template without error.', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action
  const compilerCode = compiler.compile('Hello {{ name }}');

  // Assert
  expect(compilerCode).toBeTruthy();
});

it('Nunjucks compiler should load compiled code and execute rendered template with it', async () => {
  // Arrange
  const { compiler, loader, getCreatedQueries } = await createTestCompiler();
  const { compiledData } = compiler.compile('Hello {{ name }}!');

  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', { name: 'World' });
  const queries = await getCreatedQueries();

  // Assert
  expect(queries[0]).toBe('Hello World!');
});

it('Nunjucks compiler should reject the extension which has no valid super class', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Action, Assert
  expect(() => compiler.loadExtension({})).toThrow(
    'Extension must be of type RuntimeExtension or CompileTimeExtension'
  );
});
