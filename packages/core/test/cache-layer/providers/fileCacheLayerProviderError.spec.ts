import { FileCacheLayerProvider } from '@vulcan-sql/core';

jest.mock('glob', () => {
  return (
    _path: string,
    _option: object,
    cb: (err: Error, files: string[]) => void
  ) => {
    cb(new Error('mock error'), []);
  };
});

it('File template provider should throw error with file search errors', async () => {
  // Arrange
  const provider = new FileCacheLayerProvider(
    {
      folderPath: '.',
      provider: '',
      loader: '',
    },
    {},
    ''
  );
  // Act, Assert
  const iter = provider.getFiles();
  await expect(iter.next()).rejects.toThrow('mock error');
});
