import { RawAPISchema } from '@vulcan-sql/build/schema-parser';
import { ResponseSampler } from '@vulcan-sql/build/schema-parser/middleware/responseSampler';
import { FieldDataType, TemplateEngine } from '@vulcan-sql/core';
import { Readable } from 'stream';
import * as sinon from 'ts-sinon';

it('Should create response definition when example parameter is provided', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    sample: {
      profile: 'mocked-profile',
      parameters: { someParam: 123 },
    },
  };
  const stubTemplateEngine = sinon.stubInterface<TemplateEngine>();
  stubTemplateEngine.execute.resolves({
    getColumns: () => [
      { name: 'id', type: 'string' },
      { name: 'age', type: 'number' },
    ],
    getData: () => new Readable(),
  });
  const responseSampler = new ResponseSampler(stubTemplateEngine);
  // Act
  await responseSampler.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.response?.[0].name).toEqual('id');
  expect(schema.response?.[0].type).toEqual(FieldDataType.STRING);
  expect(schema.response?.[1].name).toEqual('age');
  expect(schema.response?.[1].type).toEqual(FieldDataType.NUMBER);
});

it('Should create response definition when example parameter is a empty object', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    sample: { profile: 'test' },
  };
  const stubTemplateEngine = sinon.stubInterface<TemplateEngine>();
  stubTemplateEngine.execute.resolves({
    getColumns: () => [
      { name: 'id', type: 'string' },
      { name: 'age', type: 'number' },
    ],
    getData: () => new Readable(),
  });
  const responseSampler = new ResponseSampler(stubTemplateEngine);
  // Act
  await responseSampler.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.response?.[0].name).toEqual('id');
  expect(schema.response?.[0].type).toEqual(FieldDataType.STRING);
  expect(schema.response?.[1].name).toEqual('age');
  expect(schema.response?.[1].type).toEqual(FieldDataType.NUMBER);
});

it('Should not create response definition when example parameter is not provided', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
  };
  const stubTemplateEngine = sinon.stubInterface<TemplateEngine>();
  stubTemplateEngine.execute.resolves({
    getColumns: () => [
      { name: 'id', type: 'string' },
      { name: 'age', type: 'number' },
    ],
    getData: () => new Readable(),
  });
  const responseSampler = new ResponseSampler(stubTemplateEngine);
  // Act
  await responseSampler.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.response).toBeFalsy();
});

it('Should append response definition when there are some existed definitions', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    sourceName: 'some-name',
    sample: {
      profile: 'test',
    },
    response: [
      {
        name: 'name',
        type: 'STRING',
      },
    ],
  };
  const stubTemplateEngine = sinon.stubInterface<TemplateEngine>();
  stubTemplateEngine.execute.resolves({
    getColumns: () => [
      { name: 'id', type: 'string' },
      { name: 'age', type: 'number' },
      { name: 'name', type: 'boolean' },
    ],
    getData: () => new Readable(),
  });
  const responseSampler = new ResponseSampler(stubTemplateEngine);
  // Act
  await responseSampler.handle(schema, async () => Promise.resolve());
  // Assert
  expect(schema.response?.[0].name).toEqual('name');
  expect(schema.response?.[0].type).toEqual(FieldDataType.STRING);
  expect(schema.response?.[1].name).toEqual('id');
  expect(schema.response?.[1].type).toEqual(FieldDataType.STRING);
  expect(schema.response?.[2].name).toEqual('age');
  expect(schema.response?.[2].type).toEqual(FieldDataType.NUMBER);
});

it('Should throw error when sample.profile is not provided', async () => {
  // Arrange
  const schema: RawAPISchema = {
    templateSource: 'existed/path',
    urlPath: '/existed/path',
    sourceName: 'some-name',
    sample: { parameters: { a: 1 } },
  };
  const stubTemplateEngine = sinon.stubInterface<TemplateEngine>();
  stubTemplateEngine.execute.resolves({
    getColumns: () => [
      { name: 'id', type: 'string' },
      { name: 'age', type: 'number' },
    ],
    getData: () => new Readable(),
  });
  const responseSampler = new ResponseSampler(stubTemplateEngine);
  // Act, Assert
  await expect(
    responseSampler.handle(schema, async () => Promise.resolve())
  ).rejects.toThrow(
    `Schema /existed/path misses the required property: sample.profile`
  );
});
