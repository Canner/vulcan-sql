import { TYPES } from '@vulcan/core/containers';
import {
  NunjucksCompiler,
  InMemoryCodeLoader,
  ErrorExtension,
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
  container.bind(TYPES.CompilerExtension).to(ErrorExtension);
});

afterEach(() => {
  container.unbindAll();
});

it('Error extension should throw error with error code and the position while rendering', async () => {
  // Arrange
  const compiler = container.get<Compiler>(TYPES.Compiler);
  const loader = container.get<InMemoryCodeLoader>(TYPES.CompilerLoader);
  const { compiledData } = compiler.compile(`
{% error "This is an error" %}
  `);
  // Action, Assert
  loader.setSource('test', compiledData);
  await expect(compiler.render('test', { name: 'World' })).rejects.toThrowError(
    'This is an error at 1:3'
  );
});
