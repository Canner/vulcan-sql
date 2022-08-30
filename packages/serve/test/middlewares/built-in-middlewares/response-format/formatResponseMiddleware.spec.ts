import * as sinon from 'ts-sinon';
import { ResponseFormatMiddleware } from '@vulcan-sql/serve/middleware';
import { KoaContext } from '@vulcan-sql/serve/models';
describe('Test format response middleware', () => {
  afterEach(() => {
    sinon.default.restore();
  });

  it('Test to get default json format and empty supported format when not set any config for response formatter', async () => {
    // Arrange
    const ctx: KoaContext = {
      ...sinon.stubInterface<KoaContext>(),
    };
    // Act
    const middleware = new ResponseFormatMiddleware(
      {
        enabled: false,
      },
      '',
      []
    );

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(middleware.supportedFormats).toEqual([]);
    expect(middleware.defaultFormat).toEqual('json');
  });

  it('Test to get default "csv" format and empty supported format when set "default" is "csv', async () => {
    // Arrange
    const ctx: KoaContext = {
      ...sinon.stubInterface<KoaContext>(),
    };
    // Act
    const middleware = new ResponseFormatMiddleware(
      {
        enabled: false,
        options: {
          default: 'csv',
        },
      },
      '',
      []
    );

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(middleware.supportedFormats).toEqual([]);
    expect(middleware.defaultFormat).toEqual('csv');
  });

  it('Test to get ["hyper", "csv"] formats when set "formats" to ["hyper", "csv"]', async () => {
    // Arrange
    const ctx: KoaContext = {
      ...sinon.stubInterface<KoaContext>(),
    };
    // Act
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

    await middleware.handle(ctx, async () => Promise.resolve());

    expect(middleware.supportedFormats).toEqual(['hyper', 'csv']);
    expect(middleware.defaultFormat).toEqual('json');
  });

  // TODO: test handle to get context response
});
