import { FileTemplateProvider } from '@template-engine/.';

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
  const filePath = '.';
  const provider = new FileTemplateProvider({ folderPath: filePath });
  // Act, Assert
  const iter = provider.getTemplates();
  await expect(iter.next()).rejects.toThrow('mock error');
});
