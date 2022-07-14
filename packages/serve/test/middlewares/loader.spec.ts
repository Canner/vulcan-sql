import * as path from 'path';
import * as sinon from 'ts-sinon';
import { BaseRouteMiddleware, loadExtensions } from '@vulcan/serve/middleware';
import middlewares from '@vulcan/serve/middleware/built-in-middleware';
import { TestModeMiddleware } from './test-custom-middlewares';
import { ClassType, defaultImport } from '@vulcan/core';
import { AppConfig } from '@vulcan/serve/models';
import { flatten } from 'lodash';

// the load Built-in used for tests
const loadBuiltIn = async () => {
  // built-in middleware folder
  const builtInFolder = path.resolve(
    __dirname,
    '../../src/lib/middleware',
    'built-in-middleware'
  );
  // read built-in middlewares in index.ts, the content is an array middleware class
  const modules =
    flatten(
      await defaultImport<ClassType<BaseRouteMiddleware>[]>(builtInFolder)
    ) || [];
  return modules || [];
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
      extensions: [path.join(__dirname, 'test-custom-middlewares')],
    } as AppConfig;

    // Act
    const actual = await loadExtensions(config.extensions);
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
    const actual = await loadExtensions(config.extensions);
    // Assert
    expect(actual).not.toEqual(expect.arrayContaining(expected));
  });
});
