import { IArtifactBuilderOptions, TYPES } from '../../src';
import { Container } from 'inversify';
import { ArtifactBuilderOptions } from '../../src/options';

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind(TYPES.ArtifactBuilderOptions)
    .to(ArtifactBuilderOptions)
    .inSingletonScope();
});

it('Should provide correct default option values', async () => {
  // Action
  const options = container.get<ArtifactBuilderOptions>(
    TYPES.ArtifactBuilderOptions
  );
  // Assert
  expect(options.provider).toBe('LocalFile');
  expect(options.serializer).toBe('JSON');
});

it('Can override some option properties', async () => {
  // Arrange
  container
    .bind<Partial<IArtifactBuilderOptions>>(TYPES.ArtifactBuilderInputOptions)
    .toConstantValue({
      filePath: './result.json',
    });
  const options = container.get<ArtifactBuilderOptions>(
    TYPES.ArtifactBuilderOptions
  );
  // Assert
  expect(options.provider).toBe('LocalFile');
  expect(options.filePath).toBe('./result.json');
});

it('Schema validation should work', async () => {
  // Arrange
  container.bind(TYPES.ArtifactBuilderInputOptions).toConstantValue({
    provider: null,
  });
  // Act. Assert
  expect(() =>
    container.get<ArtifactBuilderOptions>(TYPES.ArtifactBuilderOptions)
  ).toThrow();
});
