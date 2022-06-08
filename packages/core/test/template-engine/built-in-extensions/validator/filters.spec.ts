import { createTestCompiler } from '../../testCompiler';

it('If we try to use an unloaded filter, extension should throw error', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act, Assert
  expect(() => compiler.compile(`{{ 123 | unloadedFilter }}`)).toThrow(
    'filter not found: unloadedFilter'
  );
});

it('If we try to use loaded filter, extension should return the correct list', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = compiler.compile(`{{ 123 | unique }}`);
  // Act, Assert
  expect(metadata['filter.vulcan.com'].length).toBe(1);
});

it('If we try to use a built-in filter, extension should return the correct list', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = compiler.compile(`{{ 123 | abs }}`);
  // Act, Assert
  expect(metadata['filter.vulcan.com'].length).toBe(1);
});
