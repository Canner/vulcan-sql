import { SchemaData } from '@vulcan-sql/build/models';
import { FileSchemaReader } from '@vulcan-sql/build/schema-parser';
import * as path from 'path';

it('File schema reader should provide correct files and contents', async () => {
  // Arrange
  const schemaReader = new FileSchemaReader(
    {
      folderPath: path.resolve(__dirname, '../test-schema'),
      reader: 'LocalFile',
    },
    {},
    ''
  );
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
