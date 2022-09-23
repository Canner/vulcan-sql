import * as sinon from 'ts-sinon';
import { ResponseFormatMiddleware } from '@vulcan-sql/serve/middleware';
import { BaseResponseFormatter, KoaContext } from '@vulcan-sql/serve';

describe('Test format response middleware', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Test to get default json format and empty supported format when not set any config for response formatter', async () => {
    // Arrange
    const middleware = new ResponseFormatMiddleware(
      {
        enabled: false,
      },
      '',
      []
    );
    // Act
    await middleware.activate();
    // Assert
    expect(middleware.supportedFormats).toEqual([]);
    expect(middleware.defaultFormat).toEqual('json');
  });

  it.each([
    ['json', 'json'],
    ['csv', 'csv'],
    ['hyper', 'hyper'],
  ])(
    'Test to get default %p format and empty supported format when set "default" is %p',
    async (defaultVal, expected) => {
      // Arrange
      const middleware = new ResponseFormatMiddleware(
        {
          enabled: false,
          options: {
            default: defaultVal,
          },
        },
        '',
        []
      );

      // Act
      await middleware.activate();

      expect(middleware.supportedFormats).toEqual([]);
      expect(middleware.defaultFormat).toEqual(expected);
    }
  );

  it('Test to get ["hyper", "csv"] formats when set "formats" to ["hyper", "csv"]', async () => {
    // Arrange
    const middleware = new ResponseFormatMiddleware(
      {
        enabled: false,
        options: {
          formats: ['hyper', 'csv'],
        },
      },
      '',
      []
    );

    // Act
    await middleware.activate();

    expect(middleware.supportedFormats).toEqual(['hyper', 'csv']);
    expect(middleware.defaultFormat).toEqual('json');
  });

  it('Test to throw error when default is "json" but not given default json formatter extension', async () => {
    // Arrange
    const expected = new Error(
      `The type "json" in "default" not implement extension`
    );

    const middleware = new ResponseFormatMiddleware({}, '', []);

    // Act
    const activateFunc = async () => await middleware.activate();

    // Assert
    expect(activateFunc).rejects.toThrow(expected);
  });

  it.each([['json'], ['csv'], ['hyper']])(
    'Test to throw error when default is %p but not given default %p formatter extension',
    async (defaultVal) => {
      // Arrange
      const expected = new Error(
        `The type "${defaultVal}" in "default" not implement extension`
      );

      const middleware = new ResponseFormatMiddleware(
        {
          options: {
            default: defaultVal,
          },
        },
        '',
        []
      );

      // Act
      const activateFunc = async () => await middleware.activate();

      // Assert
      expect(activateFunc).rejects.toThrow(expected);
    }
  );

  it.each([
    ['json', sinon.stubInterface<BaseResponseFormatter>()],
    ['csv', sinon.stubInterface<BaseResponseFormatter>()],
    ['hyper', sinon.stubInterface<BaseResponseFormatter>()],
  ])(
    'Test to success when default is %p but not given %p formatter extension',
    async (defaultVal, formatter) => {
      // Arrange
      formatter.getExtensionId.returns(defaultVal);

      const middleware = new ResponseFormatMiddleware(
        {
          options: {
            default: defaultVal,
          },
        },
        '',
        [formatter]
      );

      // Act
      const activateFunc = async () => await middleware.activate();

      // Assert
      expect(activateFunc).not.toThrow();
    }
  );

  it.each([[['csv', 'hyper']], [['hyper', 'csv']]])(
    'Test to throw error when formats are %p but not given %p formatter extension',
    async (formatValues) => {
      // Arrange
      const stubJsonFormatter = sinon.stubInterface<BaseResponseFormatter>();
      stubJsonFormatter.getExtensionId.returns('json');

      const expected = new Error(
        `The type "${formatValues[0]}" in "formats" not implement extension`
      );

      const middleware = new ResponseFormatMiddleware(
        {
          options: {
            formats: formatValues,
          },
        },
        '',
        [stubJsonFormatter]
      );

      // Act
      const activateFunc = async () => await middleware.activate();

      // Assert
      expect(activateFunc).rejects.toThrow(expected);
    }
  );
  it('Test to success when formats are "[json, csv]" but not given formatter extension', async () => {
    // Arrange
    const stubJsonFormatter = sinon.stubInterface<BaseResponseFormatter>();
    stubJsonFormatter.getExtensionId.returns('json');
    const stubCsvFormatter = sinon.stubInterface<BaseResponseFormatter>();
    stubCsvFormatter.getExtensionId.returns('csv');

    const middleware = new ResponseFormatMiddleware(
      {
        options: {
          formats: ['json', 'csv'],
        },
      },
      '',
      [stubJsonFormatter, stubCsvFormatter]
    );

    // Act
    const activateFunc = async () => await middleware.activate();

    // Assert
    expect(activateFunc).not.toThrow();
  });

  it('Test to success when formats are "[csv, hyper]" but not given formatter extension', async () => {
    // Arrange
    const stubJsonFormatter = sinon.stubInterface<BaseResponseFormatter>();
    stubJsonFormatter.getExtensionId.returns('json');
    const stubCsvFormatter = sinon.stubInterface<BaseResponseFormatter>();
    stubCsvFormatter.getExtensionId.returns('csv');
    const stubHyperFormatter = sinon.stubInterface<BaseResponseFormatter>();
    stubHyperFormatter.getExtensionId.returns('hyper');

    const middleware = new ResponseFormatMiddleware(
      {
        options: {
          formats: ['csv', 'hyper'],
        },
      },
      '',
      [stubJsonFormatter, stubCsvFormatter, stubHyperFormatter]
    );

    // Act
    const activateFunc = async () => await middleware.activate();

    // Assert
    expect(activateFunc).not.toThrow();
  });

  // TODO: test handle to get context response

  it('Test to do nothing with paths which are not start in /api', async () => {
    // Arrange
    const middleware = new ResponseFormatMiddleware({}, '', []);
    const mockContext = sinon.stubInterface<KoaContext>();
    mockContext.request.path = '/favicon.ico';
    mockContext.response.body = '123';
    // Act
    await middleware.handle(mockContext, async () => null);

    // Assert
    expect(mockContext.response.body).toBe('123');
  });
});
