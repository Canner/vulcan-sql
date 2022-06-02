import { createTestCompiler } from '../../testCompiler';

it('Extension should return correct values without unique by argument', async () => {
  // Arrange
  const { compiler, loader, executor } = createTestCompiler();
  const { compiledData } = compiler.compile(
    `
{% set array = [1,2,3,4,4] %}
{% for item in array | unique %}
{{ item }}
{% endfor %}
`
  );
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {});
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('1\n2\n3\n4');
});

it('Extension should return correct values with unique by keyword argument', async () => {
  // Arrange
  const { compiler, loader, executor } = createTestCompiler();
  const { compiledData } = compiler.compile(
    `
{% set array = [{name: "Tom"}, {name: "Tom"}, {name: "Joy"}] %}
{% for item in array | unique(by="name") %}
{{ item.name }}
{% endfor %}
`
  );
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {});
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('Tom\nJoy');
});

it('Extension should return correct values with unique by argument', async () => {
  // Arrange
  const { compiler, loader, executor } = createTestCompiler();
  const { compiledData } = compiler.compile(
    `
{% set array = [{name: "Tom"}, {name: "Tom"}, {name: "Joy"}] %}
{% for item in array | unique("name") %}
{{ item.name }}
{% endfor %}
`
  );
  // Action
  loader.setSource('test', compiledData);
  await compiler.execute('test', {});
  // Assert
  expect(executor.createBuilder.firstCall.args[0]).toBe('Tom\nJoy');
});
