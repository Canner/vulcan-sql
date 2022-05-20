import { TYPES } from '@vulcan/core/containers';
import {
  ITemplateEngineOptions,
  TemplateProviderType,
} from '@vulcan/core/models';
import { FileTemplateProvider } from '@vulcan/core/template-engine';
import { Container } from 'inversify';

jest.mock('glob', () => {
  return (
    _path: string,
    _option: object,
    cb: (err: Error, files: string[]) => void
  ) => {
    cb(new Error('mock error'), []);
  };
});

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind<ITemplateEngineOptions>(TYPES.TemplateEngineOptions)
    .toConstantValue({
      provider: TemplateProviderType.LocalFile,
      templatePath: '.',
    });
  container.bind(TYPES.TemplateProvider).to(FileTemplateProvider);
});

afterEach(() => {
  container.unbindAll();
});

it('File template provider should throw error with file search errors', async () => {
  // Arrange
  const provider = container.get<FileTemplateProvider>(TYPES.TemplateProvider);
  // Act, Assert
  const iter = provider.getTemplates();
  await expect(iter.next()).rejects.toThrow('mock error');
});
