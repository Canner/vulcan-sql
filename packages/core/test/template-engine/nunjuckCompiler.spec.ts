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
  const {
    compiler,
    loader,
    getCreatedQueries,
    getCreatedBinding,
    executeTemplate,
  } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    'Hello {{ context.params.name }}!'
  );

  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test', {
    name: 'World',
  });
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();

  // Assert
  expect(queries[0]).toBe('Hello $1!');
  expect(binding[0].get('$1')).toBe('World');
});

it('Nunjucks compiler should reject the extension which has no valid super class', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Action, Assert
  expect(() => compiler.loadExtension({} as any)).toThrow(
    'Extension must be of type RuntimeExtension or CompileTimeExtension'
  );
});
