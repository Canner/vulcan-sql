import { createTestCompiler } from '../../testCompiler';

it('If exist arguments behind "cache" symbol, extension should throw an error', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`{% cache variable %} some statement {% endcache %}`)
  ).rejects.toThrow(`Expected a block end, but got symbol`);
});

it('Extension compiled succeed even if exist multiple "cache" scope tags ', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`
  {% cache %} some statement1 {% endcache %}
  {% cache %} some statement2 {% endcache %}
    `)
  ).resolves.not.toThrow();
});

it('Extension compiled succeed even if not have query statement body in "cache" scope tag', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action, Assert
  await expect(
    compiler.compile(`{% cache %}{% endcache %}`)
  ).resolves.not.toThrow();
});

it('The metadata should include"isUsedTag" is true in "cache.vulcan.com" after compiled', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action
  const { metadata } = await compiler.compile(
    `{% cache %} some statement {% endcache %}`
  );

  // Action, Assert
  await expect(metadata).toMatchObject({
    'cache.vulcan.com': { isUsedTag: true },
  });
});

it('The metadata should include "isUsedTag" is false in "cache.vulcan.com" after compiled', async () => {
  // Arrange
  const { compiler } = await createTestCompiler();

  // Action
  const { metadata } = await compiler.compile('some statement');

  // Action, Assert
  await expect(metadata).toMatchObject({
    'cache.vulcan.com': { isUsedTag: false },
  });
});
