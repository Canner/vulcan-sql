import { Response } from 'koa';
import * as sinon from 'ts-sinon';
import * as Stream from 'stream';
import { JsonFormatter } from '@vulcan-sql/serve/response-formatter';
import { KoaContext } from '@vulcan-sql/serve';
import faker from '@faker-js/faker';
import { arrayToStream, streamToString } from '../test-utils';

describe('Test to respond to json', () => {
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
    const formatter = new JsonFormatter({}, '');
    formatter.formatToResponse(ctx);
    // Assert
    expect(ctx.response.body).toEqual(expected);
  });

  it('Test to destroy the source when downstream is destroyed', (done) => {
    // Arrange
    const stubResponse = sinon.stubInterface<Response>();
    const source = new Stream.Readable({
      read() {
        this.push('some-data');
        // we don't push pull to simulate an endless stream
      },
      destroy(err, cb) {
        done();
        cb(err);
      },
    });
    stubResponse.body = {
      data: source,
      columns: {},
    };
    const ctx = {
      ...sinon.stubInterface<KoaContext>(),
      url: faker.internet.url(),
      response: stubResponse,
    };
    // Act
    const formatter = new JsonFormatter({}, '');
    formatter.formatToResponse(ctx);
    (ctx.response.body as Stream.Readable).destroy();
    // Assert
    expect(true).toEqual(true);
    // the done function should be call after destroyed.
  }, 1000);

  it.each([
    {
      input: {
        data: arrayToStream([]),
        columns: [],
      },
      expected: [],
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
      expected: [
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
      ],
    },
  ])(
    'Test success when formatting to json stream',
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
      const formatter = new JsonFormatter({}, '');
      formatter.formatToResponse(ctx);
      // Assert

      const result = await streamToString(ctx.response.body as Stream);
      expect(result).toEqual(JSON.stringify(expected));
    }
  );
});
