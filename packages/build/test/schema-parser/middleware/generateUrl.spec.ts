import { RawAPISchema } from '../../../src';
import { generateUrl } from '../../../src/lib/schema-parser/middleware/generateUrl';

it('Should keep url in schema', async () => {
  // Arrange
  const schema: RawAPISchema = {
    urlPath: '/existed/path',
    sourceName: 'some-name',
  };
  // Act
  await generateUrl()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.urlPath).toEqual('/existed/path');
});

it('Should add leading slash', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
  };
  // Act
  await generateUrl()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.urlPath).toEqual('/some-name');
});

it('Should remove trailing slash', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: '/some-name/',
  };
  // Act
  await generateUrl()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.urlPath).toEqual('/some-name');
});

it('Should replace white space', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some name',
  };
  // Act
  await generateUrl()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.urlPath).toEqual('/some-name');
});
