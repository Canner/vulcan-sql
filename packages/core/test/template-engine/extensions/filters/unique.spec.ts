import { TYPES } from '@vulcan/core/containers';
import {
  NunjucksCompiler,
  InMemoryCodeLoader,
  UniqueExtension,
  Compiler,
} from '@vulcan/core/template-engine';
import { Container } from 'inversify';

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind(TYPES.CompilerLoader)
    .to(InMemoryCodeLoader)
    .inSingletonScope();
  container.bind(TYPES.Compiler).to(NunjucksCompiler).inSingletonScope();
  container.bind(TYPES.CompilerExtension).to(UniqueExtension);
});

afterEach(() => {
  container.unbindAll();
});

it('Extension should return correct values without unique by argument', async () => {
  // Arrange
  const compiler = container.get<Compiler>(TYPES.Compiler);
  const loader = container.get<InMemoryCodeLoader>(TYPES.CompilerLoader);
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

it('Extension should return correct values with unique by keyword argument', async () => {
  // Arrange
  const compiler = container.get<Compiler>(TYPES.Compiler);
  const loader = container.get<InMemoryCodeLoader>(TYPES.CompilerLoader);
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

it('Extension should return correct values with unique by argument', async () => {
  // Arrange
  const compiler = container.get<Compiler>(TYPES.Compiler);
  const loader = container.get<InMemoryCodeLoader>(TYPES.CompilerLoader);
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
  const result = await compiler.render('test', {});
  // Assert
  expect(result).toBe('Tom\nJoy');
});
