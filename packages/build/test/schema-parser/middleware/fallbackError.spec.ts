import { fallbackErrors } from '../../../src/lib/schema-parser/middleware';
import { RawAPISchema } from '../../../src';

it('Should fallback errors to empty array', async () => {
  // Arrange
  const schema: RawAPISchema = {
    urlPath: '/existed/path',
    sourceName: 'some-name',
  };
  // Act
  await fallbackErrors()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.errors).toEqual([]);
});

it('Should keep original errors value', async () => {
  // Arrange
  const schema: RawAPISchema = {
    urlPath: '/existed/path',
    sourceName: 'some-name',
    errors: [{ code: 'ERROR 1', message: 'ERROR 1' }],
  };
  // Act
  await fallbackErrors()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.errors?.length).toBe(1);
  expect(schema.errors).toContainEqual({ code: 'ERROR 1', message: 'ERROR 1' });
});
