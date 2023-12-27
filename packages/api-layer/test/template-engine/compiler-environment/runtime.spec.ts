import { InternalError, UserError } from '@vulcan-sql/api-layer';
import { createTestCompiler } from '../testCompiler';

it('Runtime env should add validation filters automatically from validators', async () => {
  // Arrange
  const { compiler, loader, executeTemplate } = await createTestCompiler();
  // Act
  const { compiledData } = await compiler.compile(
    `{{ context.params.a | abs | is_integer(min=10) }}`
  );
  loader.setSource('test', compiledData);
  // Assert
  await executeTemplate('test', { a: 123 });
});

it('Runtime env should throw internal error with invalid arguments', async () => {
  // Arrange
  const { compiler, loader, executeTemplate } = await createTestCompiler();
  // Act
  const { compiledData } = await compiler.compile(
    `{{ context.params.a | abs | is_integer(aaaa=10) }}`
  );
  loader.setSource('test', compiledData);
  // Assert
  await expect(executeTemplate('test', { a: 123 })).rejects.toThrow(
    InternalError
  );
});

it('Runtime env should throw user error with invalid data', async () => {
  // Arrange
  const { compiler, loader, executeTemplate } = await createTestCompiler();
  // Act
  const { compiledData } = await compiler.compile(
    `{{ context.params.a | abs | is_integer(max=10) }}`
  );
  loader.setSource('test', compiledData);
  // Assert
  await expect(executeTemplate('test', { a: 123 })).rejects.toThrow(UserError);
});
