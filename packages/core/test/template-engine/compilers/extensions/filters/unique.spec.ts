import {
  NunjucksCompiler,
  InMemoryCodeLoader,
} from '@template-engine/compilers/nunjucks';
import { Executor } from '@template-engine/compilers/nunjucks/extensions';
import * as sinon from 'ts-sinon';

it('Extension should return correct values without unique by argument', async () => {
  // Arrange
  const loader = new InMemoryCodeLoader();
  const mockExecutor = sinon.stubInterface<Executor>();
  const compiler = new NunjucksCompiler({ loader, executor: mockExecutor });
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
  const mockExecutor = sinon.stubInterface<Executor>();
  const compiler = new NunjucksCompiler({ loader, executor: mockExecutor });
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
