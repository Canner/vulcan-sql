import { FileSchemaReader, SchemaData } from '@vulcan/build/schema-parser';
import * as path from 'path';
import { Container } from 'inversify';
import { TYPES } from '@vulcan/build/containers';
import { SchemaParserOptions } from '@vulcan/build/options';
import { ISchemaParserOptions, SchemaReaderType } from '@vulcan/build/models';

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind<Partial<ISchemaParserOptions>>(TYPES.SchemaParserInputOptions)
    .toConstantValue({
      folderPath: path.resolve(__dirname, '../test-schema'),
      reader: SchemaReaderType.LocalFile,
    });
  container
    .bind(TYPES.SchemaParserOptions)
    .to(SchemaParserOptions)
    .inSingletonScope();
  container.bind(TYPES.SchemaReader).to(FileSchemaReader).inSingletonScope();
});

afterEach(() => {
  container.unbindAll();
});

it('File schema reader should provide correct files and contents', async () => {
  // Arrange
  const schemaReader = container.get<FileSchemaReader>(TYPES.SchemaReader);
  const schemas: SchemaData[] = [];

  // Act
  for await (const schema of schemaReader.readSchema()) {
    schemas.push(schema);
  }

  // Assert
  expect(schemas.length).toBe(2);
  expect(schemas).toContainEqual({
    sourceName: 'user',
    type: 'YAML',
    content: expect.stringContaining('url: /user/:id'),
  });
  expect(schemas).toContainEqual({
    sourceName: 'detail/role',
    type: 'YAML',
    content: expect.stringContaining('url: /detail/role/:id'),
  });
});
