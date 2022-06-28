import { FileSchemaReader, SchemaData } from '../../../src';
import * as path from 'path';

it('File schema reader should provide correct files and contents', async () => {
  // Arrange
  const filePath = path.resolve(__dirname, '../test-schema');
  const schemaReader = new FileSchemaReader({ folderPath: filePath });
  const schemas: SchemaData[] = [];

  // Act
  for await (const schema of schemaReader.readSchema()) {
    schemas.push(schema);
  }

  // Assert
  expect(schemas.length).toBe(2);
  expect(schemas).toContainEqual({
    name: 'user',
    type: 'YAML',
    content: expect.stringContaining('url: /user/:id'),
  });
  expect(schemas).toContainEqual({
    name: 'detail/role',
    type: 'YAML',
    content: expect.stringContaining('url: /detail/role/:id'),
  });
});
