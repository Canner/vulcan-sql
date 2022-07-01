import { TYPES } from '@vulcan/core/containers';
import {
  NunjucksCompiler,
  InMemoryCodeLoader,
  NunjucksCompilerExtension,
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
});

afterEach(() => {
  container.unbindAll();
});

it('Nunjucks compiler should compile template without error.', async () => {
  // Arrange
  const compiler = container.get<Compiler>(TYPES.Compiler);

  // Action
  const compilerCode = compiler.compile('Hello {{ name }}');

  // Assert
  expect(compilerCode).toBeTruthy();
});

it('Nunjucks compiler should load compiled code and render template with it', async () => {
  // Arrange
  const loader = container.get<InMemoryCodeLoader>(TYPES.CompilerLoader);
  const compiler = container.get<Compiler>(TYPES.Compiler);
  const { compiledData } = compiler.compile('Hello {{ name }}!');

  // Action
  loader.setSource('test', compiledData);
  const result = await compiler.render('test', { name: 'World' });

  // Assert
  expect(result).toBe('Hello World!');
});

it('Nunjucks compiler should reject unsupported extensions', async () => {
  // Arrange
  const compiler = container.get<NunjucksCompiler>(TYPES.Compiler);
  // Action, Assert
  // extension should have parse and name property
  expect(() =>
    compiler.loadExtension({ tags: ['test'] } as NunjucksCompilerExtension)
  ).toThrow('Unsupported extension');
});
