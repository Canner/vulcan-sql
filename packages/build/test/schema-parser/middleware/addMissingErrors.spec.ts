import { RawAPISchema } from '../../../src';
import { AddMissingErrors } from '../../../src/lib/schema-parser/middleware/addMissingErrors';

it('Should add missing error codes', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [],
    errors: [],
    metadata: {
      'error.vulcan.com': {
        errorCodes: [
          {
            code: 'ERROR 1',
            locations: [
              {
                lineNo: 0,
                columnNo: 0,
              },
            ],
          },
        ],
      },
    },
  };
  const addMissingErrors = new AddMissingErrors();
  // Act
  await addMissingErrors.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.errors?.length).toBe(1);
});

it('Existed error codes should be kept', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [],
    errors: [
      {
        code: 'ERROR 1',
        message: 'ERROR 1 with additional description',
      },
    ],
    metadata: {
      parameters: [],
      'error.vulcan.com': {
        errorCodes: [
          {
            code: 'ERROR 1',
            locations: [
              {
                lineNo: 0,
                columnNo: 0,
              },
            ],
          },
        ],
      },
    },
  };
  const addMissingErrors = new AddMissingErrors();
  // Act
  await addMissingErrors.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.errors?.length).toBe(1);
  expect(schema.errors).toContainEqual({
    code: 'ERROR 1',
    message: 'ERROR 1 with additional description',
  });
});

it('Should tolerate empty error data', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [],
    errors: [],
    metadata: {
      parameters: [],
      'error.vulcan.com': null,
    },
  };
  const addMissingErrors = new AddMissingErrors();
  // Act
  await addMissingErrors.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.errors?.length).toBe(0);
});

it('Should tolerate empty metadata', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [],
    errors: [],
  };
  const addMissingErrors = new AddMissingErrors();
  // Act
  await addMissingErrors.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.errors?.length).toBe(0);
});
