import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { ExtractPaginationParams } from '@vulcan-sql/build/schema-parser/middleware/extractPaginationParams';
import {
  Constraint,
  FieldDataType,
  FieldInType,
  PaginationMode,
} from '@vulcan-sql/api-layer';

it('Should do nothing when there is no pagination mode configured', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
  };
  const extractPaginationParams = new ExtractPaginationParams();
  // Act
  await extractPaginationParams.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema).toEqual(schema);
});

it('Should add limit and offset when pagination mode is OFFSET', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [],
    pagination: {
      mode: PaginationMode.OFFSET,
    },
  };
  const extractPaginationParams = new ExtractPaginationParams();
  // Act
  await extractPaginationParams.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.length).toBe(2);
  expect(schema.request).toContainEqual(
    expect.objectContaining({
      fieldName: 'limit',
      fieldIn: FieldInType.QUERY,
      description:
        'Offset-based Pagination: The maximum number of rows to return. default: 20',
    })
  );
  expect(schema.request).toContainEqual(
    expect.objectContaining({
      fieldName: 'offset',
      fieldIn: FieldInType.QUERY,
      description:
        'Offset-based Pagination: The offset from the row. default: 0',
    })
  );
});

it('Should merge parameters when some parameters have been defined', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        fieldName: 'limit',
        fieldIn: FieldInType.QUERY,
        description: 'Existed one',
        type: FieldDataType.STRING,
        validators: [{ name: 'integer', args: { min: -4 } }],
        constraints: [],
      },
    ],
    pagination: {
      mode: PaginationMode.OFFSET,
    },
  };
  const extractPaginationParams = new ExtractPaginationParams();
  // Act
  await extractPaginationParams.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.length).toBe(2);
  expect(schema.request).toContainEqual(
    expect.objectContaining({
      fieldName: 'limit',
      fieldIn: FieldInType.QUERY,
      description: 'Existed one',
      validators: [
        { name: 'integer', args: { min: -4 } },
        { name: 'integer', args: { min: 0 } },
      ],
    })
  );
  expect(schema.request).toContainEqual(
    expect.objectContaining({
      fieldName: 'offset',
      fieldIn: FieldInType.QUERY,
      description:
        'Offset-based Pagination: The offset from the row. default: 0',
    })
  );
});

it('Should override the description of parameters when the existed one is empty', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    request: [
      {
        fieldName: 'limit',
        fieldIn: FieldInType.QUERY,
        description: '',
        type: FieldDataType.STRING,
        validators: [],
        constraints: [Constraint.Required()],
      },
    ],
    pagination: {
      mode: PaginationMode.OFFSET,
    },
  };
  const extractPaginationParams = new ExtractPaginationParams();
  // Act
  await extractPaginationParams.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request?.length).toBe(2);
  expect(schema.request).toContainEqual(
    expect.objectContaining({
      fieldName: 'limit',
      fieldIn: FieldInType.QUERY,
      description:
        'Offset-based Pagination: The maximum number of rows to return. default: 20',
      constraints: [Constraint.Required()],
    })
  );
  expect(schema.request).toContainEqual(
    expect.objectContaining({
      fieldName: 'offset',
      fieldIn: FieldInType.QUERY,
      description:
        'Offset-based Pagination: The offset from the row. default: 0',
    })
  );
});
