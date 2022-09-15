import { CURRENT_PROFILE_NAME } from '@vulcan-sql/core/template-engine/built-in-extensions/query-builder/constants';
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
  const { compiler, loader, getCreatedQueries, getCreatedBinding } =
    await createTestCompiler();
  const { compiledData } = await compiler.compile('Hello {{ name }}!');

  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {
    name: 'World',
    [CURRENT_PROFILE_NAME]: 'mocked-profile',
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
