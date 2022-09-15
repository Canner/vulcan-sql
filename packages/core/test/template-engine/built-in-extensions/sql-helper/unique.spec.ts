import { CURRENT_PROFILE_NAME } from '@vulcan-sql/core/template-engine/built-in-extensions/query-builder/constants';
import { createTestCompiler } from '../../testCompiler';

it('Extension should return correct values without unique by argument', async () => {
  // Arrange
  const { compiler, loader, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% set array = [1,2,3,4,4] %}
{% for item in array | unique %}
{{ item }}
{% endfor %}
`
  );
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', { [CURRENT_PROFILE_NAME]: 'mocked-profile' });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('mocked-profile');
  expect(executor.createBuilder.firstCall.args[1]).toBe('$1\n$2\n$3\n$4');
  expect(Array.from(executor.createBuilder.firstCall.args[2].values())).toEqual(
    [1, 2, 3, 4]
  );
});

it('Extension should return correct values with unique by keyword argument', async () => {
  // Arrange
  const { compiler, loader, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% set array = [{name: "Tom"}, {name: "Tom"}, {name: "Joy"}] %}
{% for item in array | unique(by="name") %}
{{ item.name }}
{% endfor %}
`
  );
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', { [CURRENT_PROFILE_NAME]: 'mocked-profile' });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('mocked-profile');
  expect(executor.createBuilder.firstCall.args[1]).toBe('$1\n$2');
  expect(Array.from(executor.createBuilder.firstCall.args[2].values())).toEqual(
    ['Tom', 'Joy']
  );
});

it('Extension should return correct values with unique by argument', async () => {
  // Arrange
  const { compiler, loader, executor } = await createTestCompiler();
  const { compiledData } = await compiler.compile(
    `
{% set array = [{name: "Tom"}, {name: "Tom"}, {name: "Joy"}] %}
{% for item in array | unique("name") %}
{{ item.name }}
{% endfor %}
`
  );
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', { [CURRENT_PROFILE_NAME]: 'mocked-profile' });
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('mocked-profile');
  expect(executor.createBuilder.firstCall.args[1]).toBe('$1\n$2');
  expect(Array.from(executor.createBuilder.firstCall.args[2].values())).toEqual(
    ['Tom', 'Joy']
  );
});
