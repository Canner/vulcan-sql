import * as sinon from 'ts-sinon';
import { checkUsableFormat } from '@vulcan-sql/serve/middleware';
import { KoaContext } from '@vulcan-sql/serve/models';

describe('Test to call check usable format function', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it.each([
    ['json', false],
    ['csv', false],
    ['hyper', false],
    ['json', '*/*'],
    ['csv', '*/*'],
    ['hyper', '*/*'],
    ['json', []],
    ['csv', []],
    ['hyper', []],
    ['json', ['*/*']],
    ['csv', ['*/*']],
    ['hyper', ['*/*']],
    ['json', ['text/html', 'application/json']],
    ['csv', ['text/html', 'application/json']],
    ['hyper', ['text/html', 'application/json']],
  ])(
    'Test to get default format %p when context path no ending format and "Accept" header not matched.',
    (format, acceptsResult) => {
      // Arrange
      const expected = format;
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: '/orders',
        accepts: jest.fn().mockReturnValue(acceptsResult),
      };

      // Act
      const result = checkUsableFormat({
        context,
        supportedFormats: [],
        defaultFormat: format,
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it.each([
    ['json', [], 'json'],
    ['csv', [], 'csv'],
    ['hyper', [], 'hyper'],
  ])(
    'Test to get "Accept" format %p when context path no ending format but "Accept" header matched.',
    (format, supportedFormats, acceptFormat) => {
      // Arrange
      const expected = acceptFormat;
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: '/orders',
        accepts: jest.fn().mockReturnValue(acceptFormat),
      };

      // Act
      const result = checkUsableFormat({
        context,
        supportedFormats,
        defaultFormat: 'json',
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );

  it.each([
    ['json', [], false],
    ['json', [], '*/*'],
    ['json', [], ['text/html', 'application/json']],
    ['json', ['csv', 'hyper'], false],
    ['json', ['csv', 'hyper'], '*/*'],
    ['json', ['csv', 'hyper'], ['text/html', 'application/json']],
    ['json', ['csv', 'hyper'], 'csv'],
    ['csv', ['hyper', 'json'], false],
    ['csv', ['hyper', 'json'], '*/*'],
    ['csv', ['hyper', 'json'], ['text/html', 'application/json']],
    ['csv', ['hyper', 'json'], 'hyper'],
    ['hyper', ['csv', 'json'], false],
    ['hyper', ['csv', 'json'], '*/*'],
    ['hyper', ['csv', 'json'], ['text/html', 'application/json']],
    ['hyper', ['csv', 'json'], 'csv'],
  ])(
    'Test to throw error when context path ending format %p not matched (No matter "Accept" header %p match or not).',
    (format, supportedFormats, acceptFormat) => {
      // Arrange
      const expected = new Error(
        `Url ending format not matched in "formats" options`
      );
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: `/orders.${format}`,
        accepts: jest.fn().mockReturnValue(acceptFormat),
      };

      // Act
      const checkFunc = () =>
        checkUsableFormat({
          context,
          supportedFormats,
          defaultFormat: 'json',
        });

      // Assert
      expect(checkFunc).toThrowError(expected);
    }
  );

  it.each([
    ['json', ['json', 'hyper'], false],
    ['json', ['json', 'hyper'], '*/*'],
    ['json', ['json', 'hyper'], ['text/html', 'application/json']],
    ['json', ['json', 'hyper'], 'hyper'],
    ['csv', ['json', 'csv'], false],
    ['csv', ['json', 'csv'], '*/*'],
    ['csv', ['json', 'csv'], ['text/html', 'application/json']],
    ['csv', ['json', 'csv'], 'json'],
    ['hyper', ['csv', 'hyper'], false],
    ['hyper', ['csv', 'hyper'], '*/*'],
    ['hyper', ['csv', 'hyper'], ['text/html', 'application/json']],
    ['hyper', ['csv', 'hyper'], 'csv'],
  ])(
    'Test to get url ending format when context path ending format match (No matter "Accept" header %p match or not).',
    (format, supportedFormats, acceptFormat) => {
      // Arrange
      const expected = format;
      const context = {
        ...sinon.stubInterface<KoaContext>(),
        path: `/orders.${format}`,
        accepts: jest.fn().mockReturnValue(acceptFormat),
      };

      // Act
      const result = checkUsableFormat({
        context,
        supportedFormats,
        defaultFormat: 'json',
      });

      // Assert
      expect(result).toEqual(expected);
    }
  );
});
