import { SchemaDataType, SchemaParser, SchemaReader } from '../../src';
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
      - uuid
      - required
      `,
      type: SchemaDataType.YAML,
    };
  };
  stubSchemaReader.readSchema.returns(generator());
  const schemaParser = new SchemaParser({ schemaReader: stubSchemaReader });

  // Act
  const result = await schemaParser.parse();

  // Assert
  expect(result.schemas.length).toBe(1);
  expect(result.schemas[0].request[0].description).toBe('role id');
});
