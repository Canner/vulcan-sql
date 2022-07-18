import { RawAPISchema } from '../../../src';
import { CheckParameter } from '../../../src/lib/schema-parser/middleware/checkParameter';

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
  const checkParameter = new CheckParameter();
  // Act Assert
  await expect(
    checkParameter.handle(schema, async () => Promise.resolve())
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
    metadata: {
      'parameter.vulcan.com': [
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
  const checkParameter = new CheckParameter();
  // Act, Assert
  await expect(
    checkParameter.handle(schema, async () => Promise.resolve())
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
    metadata: {
      'parameter.vulcan.com': null,
      errors: [],
    },
  };
  const checkParameter = new CheckParameter();
  // Act, Assert
  await expect(
    checkParameter.handle(schema, async () => Promise.resolve())
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
  const checkParameter = new CheckParameter();
  // Act, Assert
  await expect(
    checkParameter.handle(schema, async () => Promise.resolve())
  ).resolves.not.toThrow();
});
