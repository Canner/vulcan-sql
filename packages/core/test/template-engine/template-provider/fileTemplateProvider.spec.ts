import { TYPES } from '@vulcan/core/containers';
import {
  ITemplateEngineOptions,
  TemplateProviderType,
} from '@vulcan/core/models';
import { FileTemplateProvider, Template } from '@vulcan/core/template-engine';
import { Container } from 'inversify';
import * as path from 'path';

let container: Container;

beforeEach(() => {
  container = new Container();
  container
    .bind<ITemplateEngineOptions>(TYPES.TemplateEngineOptions)
    .toConstantValue({
      provider: TemplateProviderType.LocalFile,
      path: path.resolve(__dirname, '../test-templates'),
    });
  container.bind(TYPES.TemplateProvider).to(FileTemplateProvider);
});

afterEach(() => {
  container.unbindAll();
});

it('File template provider should provide correct files and contents', async () => {
  // Arrange
  const provider = container.get<FileTemplateProvider>(TYPES.TemplateProvider);
  const templates: Template[] = [];

  // Act
  for await (const template of provider.getTemplates()) {
    templates.push(template);
  }
  // Assert
  expect(templates.length).toBe(3);
  expect(templates).toContainEqual({
    name: 'user',
    statement: 'select * from public.user where id = {{ id }}',
  });
  expect(templates).toContainEqual({
    name: 'group',
    statement: 'select * from public.group where id = {{ id }}',
  });
  expect(templates).toContainEqual({
    name: 'sub-folder/role',
    statement: 'select * from public.role where id = {{ id }}',
  });
});
