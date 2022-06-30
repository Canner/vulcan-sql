import { ITemplateEngineOptions, TemplateProviderType, TYPES } from '../../src';
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

it('Should provide correct default option values', async () => {
  // Action
  const options = container.get<TemplateEngineOptions>(
    TYPES.TemplateEngineOptions
  );
  // Assert
  expect(options.provider).toBe(TemplateProviderType.LocalFile);
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
  expect(options.provider).toBe(TemplateProviderType.LocalFile);
  expect(options.folderPath).toBe('./test/schemas');
});

it('Schema validation should work', async () => {
  // Arrange
  container.bind(TYPES.TemplateEngineInputOptions).toConstantValue({
    provider: null,
  });
  // Act. Assert
  expect(() =>
    container.get<TemplateEngineOptions>(TYPES.TemplateEngineOptions)
  ).toThrow();
});
