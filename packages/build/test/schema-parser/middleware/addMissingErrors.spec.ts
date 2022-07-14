import { RawAPISchema } from '../../../src';
import { addMissingErrors } from '../../../src/lib/schema-parser/middleware/addMissingErrors';
import { AllTemplateMetadata } from '@vulcan-sql/core';

it('Should add missing error codes', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [],
    errors: [],
  };
  const metadata: AllTemplateMetadata = {
    'some-name': {
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
  // Act
  await addMissingErrors(metadata)(schema, async () => Promise.resolve());
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
  };
  const metadata: AllTemplateMetadata = {
    'some-name': {
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
  // Act
  await addMissingErrors(metadata)(schema, async () => Promise.resolve());
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
  };
  const metadata: object = {
    'some-name': {
      parameters: [],
      'error.vulcan.com': null,
    },
  };
  // Act
  await addMissingErrors(metadata as AllTemplateMetadata)(schema, async () =>
    Promise.resolve()
  );
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
  const metadata: object = {};
  // Act
  await addMissingErrors(metadata as AllTemplateMetadata)(schema, async () =>
    Promise.resolve()
  );
  // Assert
  expect(schema.errors?.length).toBe(0);
});
