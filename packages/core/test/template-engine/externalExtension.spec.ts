import { createTestCompiler } from './testCompiler';
import * as path from 'path';

it('The activate function should be called before executing', async () => {
  // Arrange
  const { compiler, loader, getCreatedQueries } = await createTestCompiler({
    options: {
      extensions: {
        test: path.resolve(__dirname, 'testExtension.ts'),
      },
    },
  });
  const { compiledData } = await compiler.compile('Hello {{ 123 | test }}!');

  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {});
  const queries = await getCreatedQueries();

  // Assert
  expect(queries[0]).toBe('Hello 123-true!');
});
