import { ITemplateEngineOptions, TYPES } from '../../src';
import { Container } from 'inversify';
import { TemplateEngineOptions } from '../../src/options';

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind(TYPES.TemplateEngineOptions)
    .to(TemplateEngineOptions)
    .inSingletonScope();
});

it('Can override some option properties', async () => {
  // Arrange
  container
    .bind<Partial<ITemplateEngineOptions>>(TYPES.TemplateEngineInputOptions)
    .toConstantValue({
      folderPath: './test/schemas',
    });
  const options = container.get<TemplateEngineOptions>(
    TYPES.TemplateEngineOptions
  );
  // Assert
  expect(options.provider).toBe(undefined);
  expect(options.folderPath).toBe('./test/schemas');
});

it('Template provide can be null', async () => {
  // Arrange
  container.bind(TYPES.TemplateEngineInputOptions).toConstantValue({
    provider: null,
  });
  // Act. Assert
  expect(() =>
    container.get<TemplateEngineOptions>(TYPES.TemplateEngineOptions)
  ).not.toThrow();
});
