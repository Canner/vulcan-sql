import * as sinon from 'ts-sinon';
import { ResponseFormatMiddleware } from '@vulcan-sql/serve/middleware';
import * as responseHelpers from '@vulcan-sql/serve/middleware/built-in-middleware/response-format/helpers';
import { KoaRouterContext, MiddlewareConfig } from '@vulcan-sql/serve';

describe('Test format response middleware', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Test to skip response format when enabled = false', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
    };
    // Act
    const middleware = new ResponseFormatMiddleware({
      middlewares: {
        'response-format': {
          enabled: false,
        },
      } as MiddlewareConfig,
    });
    // spy the async function to do test
    const spy = jest.spyOn(responseHelpers, 'loadUsableFormatters');

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(spy).not.toHaveBeenCalled();
  });

  it('Test to get default json format and empty supported format when not set any config for response formatter', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
    };
    // Act
    const middleware = new ResponseFormatMiddleware({
      middlewares: {
        'response-format': {
          enabled: false,
        },
      } as MiddlewareConfig,
    });

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(middleware.supportedFormats).toEqual([]);
    expect(middleware.defaultFormat).toEqual('json');
  });

  it('Test to get default "csv" format and empty supported format when set "default" is "csv', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
    };
    // Act
    const middleware = new ResponseFormatMiddleware({
      middlewares: {
        'response-format': {
          enabled: false,
          options: {
            default: 'csv',
          },
        },
      } as MiddlewareConfig,
    });

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(middleware.supportedFormats).toEqual([]);
    expect(middleware.defaultFormat).toEqual('csv');
  });

  it('Test to get ["hyper", "csv"] formats when set "formats" to ["hyper", "csv"]', async () => {
    // Arrange
    const ctx: KoaRouterContext = {
      ...sinon.stubInterface<KoaRouterContext>(),
    };
    // Act
    const middleware = new ResponseFormatMiddleware({
      middlewares: {
        'response-format': {
          enabled: false,
          options: {
            formats: ['hyper', 'csv'],
          },
        },
      } as MiddlewareConfig,
    });

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(middleware.supportedFormats).toEqual(['hyper', 'csv']);
    expect(middleware.defaultFormat).toEqual('json');
  });

  // TODO: test handle to get context response
});
