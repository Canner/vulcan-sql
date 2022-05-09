import { RawAPISchema } from '../../../src';
import { checkParameter } from '../../../src/lib/schema-parser/middleware/checkParameter';
import { AllTemplateMetadata } from '@vulcan/core';

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
  };
  const metadata: AllTemplateMetadata = {
    'some-name': {
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
  // Act Assert
  await expect(
    checkParameter(metadata)(schema, async () => Promise.resolve())
  ).resolves.not.toThrow();
});

it(`Should throw when any parameter hasn't be defined`, async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [
      {
        fieldName: 'param1',
      },
    ],
  };
  const metadata: AllTemplateMetadata = {
    'some-name': {
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
  // Act Assert
  await expect(
    checkParameter(metadata)(schema, async () => Promise.resolve())
  ).rejects.toThrow(
    `Parameter param2.a.sub.property is not found in the schema.`
  );
});

it('Should tolerate empty parameter data', async () => {
  // Arrange
  const schema: RawAPISchema = {
    sourceName: 'some-name',
    templateSource: 'some-name',
    request: [],
    errors: [],
  };
  const metadata: object = {
    'some-name': {
      parameters: null,
      errors: [],
    },
  };
  // Act, Assert
  await expect(
    checkParameter(metadata as AllTemplateMetadata)(schema, async () =>
      Promise.resolve()
    )
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
  const metadata: object = {};
  // Act, Assert
  await expect(
    checkParameter(metadata as AllTemplateMetadata)(schema, async () =>
      Promise.resolve()
    )
  ).resolves.not.toThrow();
});
