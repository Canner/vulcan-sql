import { Template } from '@vulcan-sql/core/models';
import * as path from 'path';
import { FileTemplateProvider } from '@vulcan-sql/core/template-engine';

it('File template provider should provide correct files and contents', async () => {
  // Arrange
  const provider = new FileTemplateProvider(
    {
      provider: '',
      folderPath: path.resolve(__dirname, '../test-templates') as any,
      codeLoader: '',
    },
    {},
    ''
  );
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
