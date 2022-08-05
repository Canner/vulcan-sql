import { extensionModule, TYPES } from '@vulcan-sql/build/containers';
import {
  ISchemaParserOptions,
  SchemaFormat,
  SchemaReader,
} from '@vulcan-sql/build/models';
import { SchemaParserOptions } from '@vulcan-sql/build/options';
import { SchemaParser } from '@vulcan-sql/build/schema-parser';
import { IValidatorLoader, TYPES as CORE_TYPES } from '@vulcan-sql/core';
import { Container } from 'inversify';
import * as sinon from 'ts-sinon';

let container: Container;
let stubSchemaReader: sinon.StubbedInstance<SchemaReader>;
let stubValidatorLoader: sinon.StubbedInstance<IValidatorLoader>;

beforeEach(async () => {
  container = new Container();
  stubSchemaReader = sinon.stubInterface<SchemaReader>();
  stubValidatorLoader = sinon.stubInterface<IValidatorLoader>();

  await container.loadAsync(
    extensionModule({
      schemaParser: {
        folderPath: '',
      },
    } as any)
  );

  container.bind(TYPES.SchemaReader).toConstantValue(stubSchemaReader);
  container
    .bind<Partial<ISchemaParserOptions>>(TYPES.SchemaParserInputOptions)
    .toConstantValue({
      reader: 'LocalFile',
    });
  container
    .bind(TYPES.SchemaParserOptions)
    .to(SchemaParserOptions)
    .inSingletonScope();
  container
    .bind(CORE_TYPES.ValidatorLoader)
    .toConstantValue(stubValidatorLoader);
  container.bind(TYPES.SchemaParser).to(SchemaParser).inSingletonScope();
});

afterEach(() => {
  container.unbindAll();
});

it('Schema parser parse should return correct result', async () => {
  // Assert
  const generator = async function* () {
    yield {
      sourceName: 'detail/role',
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
  stubValidatorLoader.getValidator.returns({
    name: 'validator1',
    validateSchema: () => null,
    validateData: () => null,
  } as any);
  const schemaParser = container.get<SchemaParser>(TYPES.SchemaParser);

  // Act
  const result = await schemaParser.parse();

  // Assert
  expect(result.schemas.length).toBe(1);
  expect(result.schemas[0].request[0].description).toBe('role id');
});

it('Schema parser parse should throw with unsupported schema type', async () => {
  // Assert
  const generator = async function* () {
    yield {
      sourceName: 'detail/role',
      content: ``,
      type: 'unsupported' as SchemaFormat,
    };
  };
  stubSchemaReader.readSchema.returns(generator());
  const schemaParser = container.get<SchemaParser>(TYPES.SchemaParser);

  // Act, Assert
  await expect(schemaParser.parse()).rejects.toThrow(
    `Unsupported schema type: unsupported`
  );
});
