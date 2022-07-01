import { createTestCompiler } from '../testCompiler';

it('Compiler should throw an error if max depth of function call lookup is exceeded (100)', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  let queryString = '{{ something.a';
  for (let i = 0; i < 101; i++) {
    queryString += '.a';
  }
  queryString += '.value() }}';

  // Action, Assert
  expect(() => compiler.compile(queryString)).toThrow('Max depth reached');
});
