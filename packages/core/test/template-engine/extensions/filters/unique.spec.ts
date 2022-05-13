import {
  NunjucksCompiler,
  InMemoryCodeLoader,
  UniqueExtension,
} from '@template-engine';

it('Extension should return correct values without unique by argument', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const compiler = new NunjucksCompiler({
    loader,
    extensions: [new UniqueExtension()],
  });
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
  const result = await compiler.render('test', {});
  // Assert
  expect(result).toBe('1\n2\n3\n4');
});

it('Extension should return correct values with unique by argument', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const compiler = new NunjucksCompiler({
    loader,
    extensions: [new UniqueExtension()],
  });
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
  const result = await compiler.render('test', {});
  // Assert
  expect(result).toBe('Tom\nJoy');
});
