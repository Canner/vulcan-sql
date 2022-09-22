import { createTestCompiler } from './testCompiler';
import * as path from 'path';

it('The activate function should be called before executing', async () => {
  // Arrange
  const {
    compiler,
    loader,
    getCreatedQueries,
    getCreatedBinding,
    executeTemplate,
  } = await createTestCompiler({
    options: {
      extensions: {
        test: path.resolve(__dirname, 'testExtension.ts'),
      },
    },
  });
  const { compiledData } = await compiler.compile('Hello {{ 123 | test }}!');

  // Action
  loader.setSource('test', compiledData);
  await executeTemplate('test');
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();

  // Assert
  expect(queries[0]).toBe('Hello $1!');
  expect(Array.from(binding[0].values())).toEqual(['123-true']);
});
