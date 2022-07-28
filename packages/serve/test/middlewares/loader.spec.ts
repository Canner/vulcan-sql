import * as path from 'path';
import * as sinon from 'ts-sinon';
import { loadExtensions } from '@vulcan-sql/serve/loader';
import { BuiltInRouteMiddlewares } from '@vulcan-sql/serve/middleware/built-in-middleware';
import { BaseRouteMiddleware } from '@vulcan-sql/serve/middleware';
import { TestModeMiddleware } from './test-custom-middlewares';
import { ClassType } from '@vulcan-sql/core';
import { AppConfig } from '@vulcan-sql/serve/models';

describe('Test middleware loader', () => {
  it('Should load successfully when loading extension middlewares', async () => {
    // Arrange
    const expected = [TestModeMiddleware] as ClassType<BaseRouteMiddleware>[];

    const config = {
      extensions: [path.join(__dirname, 'test-custom-middlewares')],
    } as AppConfig;

    // Act
    const actual = await loadExtensions('middlewares', config.extensions);
    // Assert
    expect(actual).toEqual(expect.arrayContaining(expected));
  });

  it('Should load failed when loading non-existed middlewares', async () => {
    // Arrange
    const NonExistedMiddleware =
      sinon.stubInterface<ClassType<BaseRouteMiddleware>>();
    const expected = [NonExistedMiddleware] as ClassType<BaseRouteMiddleware>[];

    const config = {
      extensions: [path.join(__dirname, 'test-custom-middlewares')],
    } as AppConfig;

    // Act
    const actual = await loadExtensions('middlewares', config.extensions);
    // Assert
    expect(actual).not.toEqual(expect.arrayContaining(expected));
  });
});
