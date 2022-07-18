import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { TransformValidator } from '@vulcan-sql/build/schema-parser/middleware/transformValidator';

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
  const transformValidator = new TransformValidator();
  // Act
  await transformValidator.handle(schema, async () => Promise.resolve());
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
  const transformValidator = new TransformValidator();
  // Act
  await transformValidator.handle(schema, async () => Promise.resolve());
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
  const transformValidator = new TransformValidator();
  // Act
  await transformValidator.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request).toEqual([]);
});

it('Should add fallback value when a request has no validator', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [{ fieldName: 'field1' }],
  };
  const transformValidator = new TransformValidator();
  // Act
  await transformValidator.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.[0].validators).toEqual([]);
});
