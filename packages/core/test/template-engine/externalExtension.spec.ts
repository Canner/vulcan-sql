import { createTestCompiler } from './testCompiler';
import * as path from 'path';
import { CURRENT_PROFILE_NAME } from '@vulcan-sql/core/template-engine/built-in-extensions/query-builder/constants';

it('The activate function should be called before executing', async () => {
  // Arrange
  const { compiler, loader, getCreatedQueries, getCreatedBinding } =
    await createTestCompiler({
      options: {
        extensions: {
          test: path.resolve(__dirname, 'testExtension.ts'),
        },
      },
    });
  const { compiledData } = await compiler.compile('Hello {{ 123 | test }}!');

  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', { [CURRENT_PROFILE_NAME]: 'mock-profile' });
  const queries = await getCreatedQueries();
  const binding = await getCreatedBinding();

  // Assert
  expect(queries[0]).toBe('Hello $1!');
  expect(Array.from(binding[0].values())).toEqual(['123-true']);
});
