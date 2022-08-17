import { Request } from 'koa';
import * as sinon from 'ts-sinon';
import faker from '@faker-js/faker';
import * as responseHelpers from '@vulcan-sql/serve/middleware/response-format/helpers';
import { BaseResponseFormatter, KoaRouterContext } from '@vulcan-sql/serve';
import {
  checkUsableFormat,
  isReceivedFormatRequest,
  ResponseFormatterMap,
} from '@vulcan-sql/serve/middleware';
import {
  CsvFormatter,
  JsonFormatter,
} from '@vulcan-sql/serve/response-formatter';

class HyperFormatter extends BaseResponseFormatter {
  public format(): any {}

  public toResponse() {}
}

it.each([
  {
    request: {
      path: `${faker.internet.url()}.json`,
      accepts: jest.fn().mockReturnValue(false),
    },
    format: 'json',
    expected: true,
  },
  {
    request: {
      path: faker.internet.url(),
      accepts: jest.fn().mockReturnValue('application/json'),
    },
    format: 'json',
    expected: true,
  },
  {
    request: {
      path: `${faker.internet.url()}.json`,
      accepts: jest.fn().mockReturnValue(false),
    },
    format: 'csv',
    expected: false,
  },
])(
  'Test to get $expected when call received format request with $request, format "$format"',
  ({ request, format, expected }) => {
    // Arrange
    const context = {
      ...sinon.stubInterface<KoaRouterContext>(),
      request: {
        ...sinon.stubInterface<Request>(),
        path: request.path,
        accepts: request.accepts,
      } as Request,
    };
    // Act
    const result = isReceivedFormatRequest(context, format);
    // Assert
    expect(result).toEqual(expected);
  }
);

describe('Test to call check usable format function', () => {
  afterEach(() => {
    sinon.default.restore();
  });
  it.each([
    {
      defaultFormat: 'json',
      expected: 'json',
    },
    {
      defaultFormat: 'csv',
      expected: 'csv',
    },
    {
      defaultFormat: 'hyper',
      expected: 'hyper',
    },
  ])(
    'Test to get default format "$expected" when check usable format with empty support formats',
    ({ defaultFormat, expected }) => {
      // Arrange
      const input = {
        formatters: {
          csv: new CsvFormatter({}, 'csv'),
          json: new JsonFormatter({}, 'json'),
          hyper: new HyperFormatter({}, ''),
        } as ResponseFormatterMap,
        supportedFormats: [],
      };

      // Act
      const result = checkUsableFormat({
        context: sinon.stubInterface<KoaRouterContext>(),
        formatters: input.formatters,
        supportedFormats: input.supportedFormats,
        defaultFormat,
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it.each([
    {
      defaultFormat: 'hyper',
    },
    {
      defaultFormat: 'json',
    },
  ])(
    'Test to throw error when check usable format with empty support formats, but default format "$defaultFormat" not existed in formatters',
    ({ defaultFormat }) => {
      // Arrange
      const expected = new Error(
        `Not find implemented formatters named ${defaultFormat}`
      );

      // Act
      const checkUsableFormatAction = () =>
        checkUsableFormat({
          context: sinon.stubInterface<KoaRouterContext>(),
          formatters: {},
          supportedFormats: [],
          defaultFormat,
        });

      // Assert
      expect(checkUsableFormatAction).toThrowError(expected);
    }
  );

  it.each([
    {
      formatters: {
        hyper: new HyperFormatter({}, ''),
      } as ResponseFormatterMap,
      supportedFormats: ['csv', 'json'],
      defaultFormat: 'hyper',
      expected: 'hyper',
    },
    {
      formatters: {
        json: new JsonFormatter({}, 'json'),
      } as ResponseFormatterMap,
      supportedFormats: ['csv', 'hyper'],
      defaultFormat: 'json',
      expected: 'json',
    },
  ])(
    'Test to get default format "$expected" when check usable format with supported formats "$supportedFormats" but formatters not matched',
    ({ formatters, supportedFormats, defaultFormat, expected }) => {
      // Arrange

      sinon.default
        .stub(responseHelpers, 'isReceivedFormatRequest')
        .returns(true);

      // Act
      const result = checkUsableFormat({
        context: sinon.stubInterface<KoaRouterContext>(),
        formatters,
        supportedFormats,
        defaultFormat,
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it.each([
    {
      formatters: {
        json: new JsonFormatter({}, 'json'),
        hyper: new HyperFormatter({}, ''),
      } as ResponseFormatterMap,
      supportedFormats: ['csv', 'hyper'],
      defaultFormat: 'json',
      expected: 'json',
    },
    {
      formatters: {
        json: new JsonFormatter({}, 'json'),
        hyper: new HyperFormatter({}, ''),
      } as ResponseFormatterMap,
      supportedFormats: ['csv', 'json'],
      defaultFormat: 'hyper',
      expected: 'hyper',
    },
  ])(
    'Test to get default format "$expected" when check usable format with matched formatter in supported formats "$supportedFormats" but not received format request',
    ({ formatters, supportedFormats, defaultFormat, expected }) => {
      // Arrange

      sinon.default
        .stub(responseHelpers, 'isReceivedFormatRequest')
        .returns(false);

      // Act
      const result = checkUsableFormat({
        context: sinon.stubInterface<KoaRouterContext>(),
        formatters,
        supportedFormats,
        defaultFormat,
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it.each([
    {
      formatters: {
        json: new JsonFormatter({}, ''),
        hyper: new HyperFormatter({}, ''),
      } as ResponseFormatterMap,
      supportedFormats: ['csv', 'json', 'hyper'],
      defaultFormat: 'hyper',
      expected: 'json',
    },
    {
      formatters: {
        json: new JsonFormatter({}, ''),
        hyper: new HyperFormatter({}, ''),
      } as ResponseFormatterMap,
      supportedFormats: ['csv', 'hyper', 'json'],
      defaultFormat: 'json',
      expected: 'hyper',
    },
  ])(
    'Test to get format "$expected" when check usable format with matched formatter in supported formats "$supportedFormats" and received format request',
    ({ formatters, supportedFormats, defaultFormat, expected }) => {
      // Arrange
      sinon.default
        .stub(responseHelpers, 'isReceivedFormatRequest')
        .returns(true);

      // Act
      const result = checkUsableFormat({
        context: sinon.stubInterface<KoaRouterContext>(),
        formatters,
        supportedFormats,
        defaultFormat,
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );
});
