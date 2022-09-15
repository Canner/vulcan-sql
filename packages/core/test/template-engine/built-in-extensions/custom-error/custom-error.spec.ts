import { CURRENT_PROFILE_NAME } from '@vulcan-sql/core/template-engine/built-in-extensions/query-builder/constants';
import { createTestCompiler } from '../../testCompiler';

it('Extension should throw custom error with error code and the position while executing', async () => {
  // Arrange
  const { compiler, loader } = await createTestCompiler();
  const { compiledData } = await compiler.compile(`
{% error "This is an error" %}
  `);
  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(
    compiler.execute('test', {
      name: 'World',
      [CURRENT_PROFILE_NAME]: 'mocked-profile',
    })
  ).rejects.toThrowError('This is an error at 1:3');
});

it('Extension should provide a correct error list', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act
  const { metadata } = await compiler.compile(`
{% error "ERROR_CODE" %}
{% error "ERROR_CODE_2" %}
{% error "ERROR_CODE_2" %}
    `);

  // Assert
  expect(metadata['error.vulcan.com'].errorCodes.length).toBe(2);
  expect(metadata['error.vulcan.com'].errorCodes).toContainEqual({
    code: 'ERROR_CODE',
    locations: [
      {
        lineNo: 1,
        columnNo: 9,
      },
    ],
  });
  expect(metadata['error.vulcan.com'].errorCodes).toContainEqual({
    code: 'ERROR_CODE_2',
    locations: [
      {
        lineNo: 2,
        columnNo: 9,
      },
      {
        lineNo: 3,
        columnNo: 9,
      },
    ],
  });
});

it('If the arguments of the extension are not the same as expected, the extension should throw error', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();
  // Act, Assert
  await expect(
    compiler.compile(`
  {% error QAQ %}
    `)
  ).rejects.toThrow(`Expected literal, got Symbol`);
});
