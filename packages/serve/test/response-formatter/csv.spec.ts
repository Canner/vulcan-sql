import faker from '@faker-js/faker';
import * as sinon from 'ts-sinon';
import * as Stream from 'stream';
import { Response } from 'koa';
import {
  arrStringToCsvString,
  CsvFormatter,
} from '@vulcan-sql/serve/response-formatter';
import { KoaContext } from '@vulcan-sql/serve';
import { arrayToStream, streamToString } from '../test-utils';

describe('Test array string to csv string', () => {
  it.each([
    {
      input: ['val', 0, true, JSON.stringify({ key: 1, value: 'subVal' })],
      expected: '"val",0,true,"{""key"":1,""value"":""subVal""}"',
    },
    {
      input: ['val', 0, true, JSON.stringify([1, 'value'])],
      expected: '"val",0,true,"[1,""value""]"',
    },
  ])('Test array to string to csv', ({ input, expected }) => {
    // Act
    const result = arrStringToCsvString(JSON.stringify(input));
    // Assert
    expect(result).toBe(expected);
  });
});

describe('Test to respond to csv', () => {
  it('Test to keep original response when not found "data" or "columns" in ctx.response.body', () => {
    // Arrange
    const expected = 'hello';
    const stubResponse = sinon.stubInterface<Response>();
    stubResponse.set.callsFake(() => null);
    stubResponse.body = expected;
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      url: faker.internet.url(),
      response: stubResponse,
    };
    // Act
    const formatter = new CsvFormatter({}, '');
    formatter.formatToResponse(ctx);
    // Assert
    expect(ctx.response.body).toEqual(expected);
  });

  it.each([
    {
      input: {
        data: arrayToStream([]),
        columns: [
          { name: 'name', type: 'varchar' },
          { name: 'age', type: 'integer' },
          { name: 'hobby', type: 'array' },
        ],
      },
      expected: `\ufeffname,age,hobby\n`,
    },
    {
      input: {
        data: arrayToStream([
          {
            column1: '5ccbe099-3647-47f6-b16a-847184dc8349',
            column2: 'abc',
            column3: 1,
          },
          {
            column1: 'b77f2033-015b-4c0c-bfa1-b354bcb18a6e',
            column2: 'deg',
            column3: 2,
          },
        ]),
        columns: [
          { name: 'column1', type: 'uuid' },
          { name: 'column2', type: 'varchar' },
          { name: 'column3', type: 'integer' },
        ],
      },
      expected: `\ufeffcolumn1,column2,column3\n"5ccbe099-3647-47f6-b16a-847184dc8349","abc",1\n"b77f2033-015b-4c0c-bfa1-b354bcb18a6e","deg",2\n`,
    },
    {
      input: {
        data: arrayToStream([
          {
            name: 'jack',
            age: 18,
            hobby: ['novels', 'basketball'],
          },
          {
            name: 'mercy',
            age: 20,
            hobby: ['shopping', 'jogging'],
          },
        ]),
        columns: [
          { name: 'name', type: 'varchar' },
          { name: 'age', type: 'integer' },
          { name: 'hobby', type: 'array' },
        ],
      },
      expected: `\ufeffname,age,hobby\n"jack",18,"[""novels"",""basketball""]"\n"mercy",20,"[""shopping"",""jogging""]"\n`,
    },
  ])(
    'Test success when formatting to csv stream',
    async ({ input, expected }) => {
      // Arrange
      const stubResponse = sinon.stubInterface<Response>();
      stubResponse.set.callsFake(() => null);
      // source data & columns
      stubResponse.body = {
        data: input.data,
        columns: input.columns,
      };
      const ctx = {
        ...sinon.stubInterface<KoaContext>(),
        url: faker.internet.url(),
        response: stubResponse,
      };

      // Act
      const formatter = new CsvFormatter({}, '');
      formatter.formatToResponse(ctx);
      // Assert

      const result = await streamToString(ctx.response.body as Stream);
      expect(result).toEqual(expected);
    }
  );
});
