import { InternalError, UserError } from '@vulcan-sql/api-layer';
import { KoaContext } from '@vulcan-sql/serve';
import { ErrorHandlerMiddleware } from '@vulcan-sql/serve/middleware';
import * as sinon from 'ts-sinon';

describe('Test error handler middlewares', () => {
  it('it should do nothing when disabled', async () => {
    // Arrange
    const middleware = new ErrorHandlerMiddleware({ enabled: false }, '');
    const context = sinon.stubInterface<KoaContext>();
    // Act, Assert
    await expect(
      middleware.handle(context, async () => {
        throw new Error();
      })
    ).rejects.toThrow();
  });

  it('it should catch UserError and show error code and error message', async () => {
    // Arrange
    const middleware = new ErrorHandlerMiddleware({}, '');
    const context = sinon.stubInterface<KoaContext>();
    // Act
    await middleware.handle(context, async () => {
      throw new UserError('rrr', { code: 'vulcan.mock' });
    });
    // Assert
    expect(context.response.body).toMatchObject({
      code: 'vulcan.mock',
      message: 'rrr',
    });
  });

  it('it should catch InternalError and show error message without any further information', async () => {
    // Arrange
    const middleware = new ErrorHandlerMiddleware({}, '');
    const context = sinon.stubInterface<KoaContext>();
    // Act
    await middleware.handle(context, async () => {
      throw new InternalError('rrr', { code: 'vulcan.mock' });
    });
    // Assert
    expect(context.response.body).toMatchObject({
      message: 'An internal error occurred',
    });
    expect((context.response.body as any).code).toBeUndefined();
  });

  it('it should catch Error and show error message without any further information', async () => {
    // Arrange
    const middleware = new ErrorHandlerMiddleware({}, '');
    const context = sinon.stubInterface<KoaContext>();
    // Act
    await middleware.handle(context, async () => {
      throw new Error('rrr');
    });
    // Assert
    expect(context.response.body).toMatchObject({
      message: 'An internal error occurred',
    });
    expect((context.response.body as any).code).toBeUndefined();
  });
});
