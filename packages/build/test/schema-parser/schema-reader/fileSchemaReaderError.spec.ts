import { FileSchemaReader } from '../../../src';
import * as path from 'path';

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
  const filePath = path.resolve('.');
  const schemaReader = new FileSchemaReader({ folderPath: filePath });
  // Act, Assert
  const iter = schemaReader.readSchema();
  await expect(iter.next()).rejects.toThrow('mock error');
});
