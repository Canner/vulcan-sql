import * as path from 'path';
import * as sinon from 'ts-sinon';
import { BaseRouteMiddleware, RouteMiddlewareLoader } from '@middleware/.';
import middlewares from '@middleware/built-in-middlewares';
import { TestModeMiddleware } from './test-custom-middlewares';
import { Type } from '@vulcan/core';
import { ServeConfig } from '@config';

describe('Test middleware loader', () => {
  it('Should load successfully when loading built-in and extension middlewares', async () => {
    // Arrange
    const expected = [
      ...middlewares,
      TestModeMiddleware,
    ] as Type<BaseRouteMiddleware>[];

    const config = {
      extension: path.join(__dirname, 'test-custom-middlewares'),
    } as ServeConfig;

    const loader = new RouteMiddlewareLoader(config);
    // Act
    const actual = await loader.load();
    // Assert
    expect(actual).toEqual(expect.arrayContaining(expected));
  });

  it('Should load failed when loading non-existed middlewares', async () => {
    // Arrange
    const NonExistedMiddleware =
      sinon.stubInterface<Type<BaseRouteMiddleware>>();
    const expected = [NonExistedMiddleware] as Type<BaseRouteMiddleware>[];

    const config = {
      extension: path.join(__dirname, 'test-custom-middlewares'),
    } as ServeConfig;

    const loader = new RouteMiddlewareLoader(config);
    // Act
    const actual = await loader.load();
    // Assert
    expect(actual).not.toEqual(expect.arrayContaining(expected));
  });
});
