import 'reflect-metadata';
import { RawAPISchema } from '@vulcan/build/schema-parser';
import { transformValidator } from '@vulcan/build/schema-parser/middleware/transformValidator';

it('Should convert string validator to proper format', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        validators: ['validator1'],
      },
    ],
  };
  // Act
  await transformValidator()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].validators?.[0]).toEqual({
    name: 'validator1',
    args: {},
  });
});

it('Should add fallback value when a validator has no argument', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        validators: [{ name: 'validator1' }],
      },
    ],
  };
  // Act
  await transformValidator()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].validators?.[0]).toEqual({
    name: 'validator1',
    args: {},
  });
});

it('Should add fallback value when there is no request', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
  };
  // Act
  await transformValidator()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request).toEqual([]);
});

it('Should add fallback value when a request has no validator', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [{ fieldName: 'field1' }],
  };
  // Act
  await transformValidator()(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].validators).toEqual([]);
});
