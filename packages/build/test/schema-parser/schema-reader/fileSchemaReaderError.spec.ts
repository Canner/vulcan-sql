import { FileSchemaReader } from '@vulcan/build/schema-parser';
import * as path from 'path';
import { SchemaParserOptions } from '@vulcan/build/options';
import { TYPES } from '@vulcan/build/containers';
import { ISchemaParserOptions, SchemaReaderType } from '@vulcan/build/models';
import { Container } from 'inversify';

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

jest.mock('glob', () => {
  return (
    _path: string,
    _option: object,
    cb: (err: Error, files: string[]) => void
  ) => {
    cb(new Error('mock error'), []);
  };
});

it('File schema reader should throw error with file search errors', async () => {
  // Arrange
  const schemaReader = container.get<FileSchemaReader>(TYPES.SchemaReader);
  // Act, Assert
  const iter = schemaReader.readSchema();
  await expect(iter.next()).rejects.toThrow('mock error');
});
