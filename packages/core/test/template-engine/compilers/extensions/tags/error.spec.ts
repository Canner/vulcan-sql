import {
  NunjucksCompiler,
  InMemoryCodeLoader,
} from '@template-engine/compilers/nunjucks';
import { Executor } from '@template-engine/compilers/nunjucks/extensions';
import * as sinon from 'ts-sinon';

it('Error extension should throw error with error code and the position while rendering', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const mockExecutor = sinon.stubInterface<Executor>();
  const compiler = new NunjucksCompiler({ loader, executor: mockExecutor });
  const { compiledData } = compiler.compile(`
{% error "This is an error" %}
  `);
  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(compiler.render('test', { name: 'World' })).rejects.toThrowError(
    'This is an error at 1:3'
  );
});
