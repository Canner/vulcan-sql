import { FieldInType } from '@vulcan-sql/core';
import { RawAPISchema } from '../../../src';
import { AddParameter } from '../../../src/lib/schema-parser/middleware/addParameter';

it('Should pass when every parameter has been defined', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [
      {
        fieldName: 'param1',
      },
      {
        fieldName: 'param2',
      },
    ],
    metadata: {
      parameters: [
        {
          name: 'param1',
          locations: [],
        },
        {
          name: 'param2.a.sub.property',
          locations: [],
        },
      ],
      errors: [],
    },
  };
  const addParameter = new AddParameter();
  // Act Assert
  await expect(
    addParameter.handle(schema, async () => Promise.resolve())
  ).resolves.not.toThrow();
});

it(`Should add query parameter automatically when some parameters haven't be defined`, async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [
      { fieldName: 'param1', fieldIn: FieldInType.PATH, description: 'origin' },
    ],
    metadata: {
      'parameter.vulcan.com': [
        {
          name: 'param1',
          locations: [],
        },
        {
          name: 'param2',
          locations: [],
        },
        {
          name: 'param3.a.sub.property',
          locations: [],
        },
      ],
      errors: [],
    },
  };
  const addParameter = new AddParameter();
  // Act
  await addParameter.handle(schema, async () => Promise.resolve());

  // Assert
  expect(schema.request![0]).toEqual({
    fieldName: 'param1',
    fieldIn: FieldInType.PATH,
    description: 'origin',
  });
  expect(schema.request![1]).toEqual({
    fieldName: 'param2',
    fieldIn: FieldInType.QUERY,
    validators: [],
  });
  expect(schema.request![2]).toEqual({
    fieldName: 'param3',
    fieldIn: FieldInType.QUERY,
    validators: [],
  });
});

it('Should tolerate empty parameter data', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [],
    errors: [],
    metadata: {
      'parameter.vulcan.com': null,
      errors: [],
    },
  };
  const addParameter = new AddParameter();
  // Act, Assert
  await expect(
    addParameter.handle(schema, async () => Promise.resolve())
  ).resolves.not.toThrow();
});

it('Should tolerate empty metadata', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [],
    errors: [],
  };
  const addParameter = new AddParameter();
  // Act, Assert
  await expect(
    addParameter.handle(schema, async () => Promise.resolve())
  ).resolves.not.toThrow();
});

it('Should tolerate empty request and add fallback value for it', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    errors: [],
  };
  const addParameter = new AddParameter();
  // Act
  await addParameter.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.request).toEqual([]);
});
