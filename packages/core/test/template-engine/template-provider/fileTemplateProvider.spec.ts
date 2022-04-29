import { FileTemplateProvider, Template } from '../../../src';
import * as path from 'path';

it('File template provider should provide correct files and contents', async () => {
  // Arrange
  const filePath = path.resolve(__dirname, '../test-templates');
  const provider = new FileTemplateProvider({ folderPath: filePath });
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
