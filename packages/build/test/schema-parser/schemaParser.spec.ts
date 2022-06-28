import {
  SchemaFormat,
  SchemaParser,
  SchemaReader,
  ValidatorLoader,
} from '../../src';
import * as sinon from 'ts-sinon';

it('Schema parser parse should return correct result', async () => {
  // Assert
  const stubSchemaReader = sinon.stubInterface<SchemaReader>();
  const generator = async function* () {
    yield {
      name: 'detail/role',
      content: `
request:
  - fieldName: id
    in: query
    description: role id
    validators:
      - name: uuid
      `,
      type: SchemaFormat.YAML,
    };
  };
  stubSchemaReader.readSchema.returns(generator());
  const stubValidatorLoader = sinon.stubInterface<ValidatorLoader>();
  stubValidatorLoader.getLoader.returns({
    name: 'validator1',
    validateSchema: () => true,
    validateData: () => true,
  });
  const schemaParser = new SchemaParser({
    schemaReader: stubSchemaReader,
    validatorLoader: stubValidatorLoader,
  });

  // Act
  const result = await schemaParser.parse();

  // Assert
  expect(result.schemas.length).toBe(1);
  expect(result.schemas[0].request[0].description).toBe('role id');
});

it('Schema parser parse should throw with unsupported schema type', async () => {
  // Assert
  const stubSchemaReader = sinon.stubInterface<SchemaReader>();
  const generator = async function* () {
    yield {
      name: 'detail/role',
      content: ``,
      type: 'unsupported' as SchemaFormat,
    };
  };
  stubSchemaReader.readSchema.returns(generator());
  const stubValidatorLoader = sinon.stubInterface<ValidatorLoader>();
  const schemaParser = new SchemaParser({
    schemaReader: stubSchemaReader,
    validatorLoader: stubValidatorLoader,
  });

  // Act, Assert
  await expect(schemaParser.parse()).rejects.toThrow(
    `Unsupported schema type: unsupported`
  );
});
