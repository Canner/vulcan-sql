import { createTestCompiler } from '../../testCompiler';

it('Error extension should throw error with error code and the position while rendering', async () => {
  // Arrange
  const { compiler, loader } = createTestCompiler();
  const { compiledData } = compiler.compile(`
{% error "This is an error" %}
  `);
  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(
    compiler.execute('test', { name: 'World' })
  ).rejects.toThrowError('This is an error at 1:3');
});
