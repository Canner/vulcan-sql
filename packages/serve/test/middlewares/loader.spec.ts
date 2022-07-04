import * as path from 'path';
import * as sinon from 'ts-sinon';
import { BaseRouteMiddleware, loadExtensions } from '@vulcan/serve/middleware';
import middlewares from '@vulcan/serve/middleware/built-in-middleware';
import { TestModeMiddleware } from './test-custom-middlewares';
import { ClassType, defaultImport } from '@vulcan/core';
import { ServeConfig } from '@vulcan/serve/config';

// the load Built-in used for tests
const loadBuiltIn = async () => {
  // built-in middleware folder
  const builtInFolder = path.resolve(
    __dirname,
    '../../src/lib/middleware',
    'built-in-middleware'
  );
  // read built-in middlewares in index.ts, the content is an array middleware class
  return (
    (await defaultImport<ClassType<BaseRouteMiddleware>[]>(builtInFolder)) || []
  );
};

describe('Test middleware loader', () => {
  it('Should load successfully when loading built-in middlewares', async () => {
    // Arrange

    const expected = [...middlewares] as ClassType<BaseRouteMiddleware>[];
    // Act
    const actual = await loadBuiltIn();
    // Assert
    expect(actual).toEqual(expect.arrayContaining(expected));
  });
  it('Should load successfully when loading extension middlewares', async () => {
    // Arrange
    const expected = [TestModeMiddleware] as ClassType<BaseRouteMiddleware>[];

    const config = {
      extension: path.join(__dirname, 'test-custom-middlewares'),
    } as ServeConfig;

    // Act
    const actual = await loadExtensions(config.extension);
    // Assert
    expect(actual).toEqual(expect.arrayContaining(expected));
  });

  it('Should load failed when loading non-existed middlewares', async () => {
    // Arrange
    const NonExistedMiddleware =
      sinon.stubInterface<ClassType<BaseRouteMiddleware>>();
    const expected = [NonExistedMiddleware] as ClassType<BaseRouteMiddleware>[];

    const config = {
      extension: path.join(__dirname, 'test-custom-middlewares'),
    } as ServeConfig;

    // Act
    const actual = await loadExtensions(config.extension);
    // Assert
    expect(actual).not.toEqual(expect.arrayContaining(expected));
  });
});
