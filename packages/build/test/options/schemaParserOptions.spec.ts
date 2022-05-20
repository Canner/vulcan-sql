import { ISchemaParserOptions, SchemaReaderType, TYPES } from '../../src';
import { Container } from 'inversify';
import { SchemaParserOptions } from '../../src/options';

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind(TYPES.SchemaParserOptions)
    .to(SchemaParserOptions)
    .inSingletonScope();
});

it('Should provide correct default option values', async () => {
  // Action
  const options = container.get<SchemaParserOptions>(TYPES.SchemaParserOptions);
  // Assert
  expect(options.reader).toBe(SchemaReaderType.LocalFile);
});

it('Can override some option properties', async () => {
  // Arrange
  container
    .bind<Partial<ISchemaParserOptions>>(TYPES.SchemaParserInputOptions)
    .toConstantValue({
      schemaPath: './test/schemas',
    });
  const options = container.get<SchemaParserOptions>(TYPES.SchemaParserOptions);
  // Assert
  expect(options.reader).toBe(SchemaReaderType.LocalFile);
  expect(options.schemaPath).toBe('./test/schemas');
});

it('Schema validation should work', async () => {
  // Arrange
  container.bind(TYPES.SchemaParserInputOptions).toConstantValue({
    reader: null,
  });
  // Act. Assert
  expect(() =>
    container.get<SchemaParserOptions>(TYPES.SchemaParserOptions)
  ).toThrow();
});
