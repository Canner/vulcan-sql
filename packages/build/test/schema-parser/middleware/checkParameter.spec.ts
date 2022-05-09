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
    },
  };
  // Act Assert
  await expect(
    checkParameter(metadata)(schema, async () => Promise.resolve())
  ).rejects.toThrow(
    `Parameter param2.a.sub.property is not found in the schema.`
  );
});
