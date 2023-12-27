import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { TransformPaginationMode } from '@vulcan-sql/build/schema-parser/middleware/transformPaginationMode';
import { PaginationMode } from '@vulcan-sql/api-layer';

it('Should do nothing when there is no pagination mode configured', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
  };
  const transformPaginationMode = new TransformPaginationMode();
  // Act
  await transformPaginationMode.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema).toEqual(schema);
});

it('Should transform pagination mode when it has been configured', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    pagination: {
      mode: 'oFfSeT' as any,
    },
  };
  const transformPaginationMode = new TransformPaginationMode();
  // Act
  await transformPaginationMode.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.pagination?.mode).toEqual(PaginationMode.OFFSET);
});
