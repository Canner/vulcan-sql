import { NunjucksCompiler, InMemoryCodeLoader } from '../../../../src';

it('Error extension should throw error with error code and the position while rendering', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const compiler = new NunjucksCompiler({ loader });
  const compilerCode = compiler.compile(`
{% error "This is an error" %}
  `);
  // Action, Assert
  loader.setSource('test', compilerCode);
  await expect(compiler.render('test', { name: 'World' })).rejects.toThrowError(
    'This is an error at 1:3'
  );
});
