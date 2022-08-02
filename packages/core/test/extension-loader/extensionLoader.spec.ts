import {
  ExtensionLoader,
  FilterBuilder,
  TYPES,
  VulcanInternalExtension,
} from '@vulcan-sql/core';
import { Container } from 'inversify';
import * as path from 'path';

@VulcanInternalExtension('test1')
class Test1 extends FilterBuilder {
  public filterName = 'test1';
  public obtainConfig() {
    return this.getConfig();
  }
}

@VulcanInternalExtension('test2')
class Test2 extends FilterBuilder {
  public filterName = 'test2';
  public obtainConfig() {
    return this.getConfig();
  }
}

class Test3 extends FilterBuilder {
  public filterName = 'test3';
}

it.each([
  ['array', [Test1, Test2]],
  ['object', { test1: Test1, test2: Test2 }],
])(
  'Extension loader should load internal extension modules with %s type',
  async (_, module: any) => {
    // Arrange
    const loader = new ExtensionLoader({} as any);
    loader.loadInternalExtensionModule(module);
    const container = new Container();

    // Act
    loader.bindExtensions(container.bind.bind(container));
    const allExtensions = container.getAll(TYPES.Extension_TemplateEngine);

    // Assert
    expect(allExtensions.length).toBe(2);
    expect((allExtensions as any)[0].filterName).toBe('test1');
    expect((allExtensions as any)[1].filterName).toBe('test2');
  }
);

it.each([
  ['default array', 'defaultArray'],
  ['default object', 'defaultObject'],
  ['export', 'export'],
])(
  'Extension loader should load external extension modules with %s type',
  async (_, extPath: any) => {
    // Arrange
    const loader = new ExtensionLoader({
      extensions: {
        test: [path.resolve(__dirname, 'test-extension', extPath)],
      },
    } as any);
    await loader.loadExternalExtensionModules();
    const container = new Container();

    // Act
    loader.bindExtensions(container.bind.bind(container));
    const allExtensions = container.getAll(TYPES.Extension_TemplateEngine);
    // Assert
    expect(allExtensions.length).toBe(2);
    expect((allExtensions as any)[0].filterName).toBe('test1');
    expect((allExtensions as any)[1].filterName).toBe('test2');
  }
);

it('Extension loader should throw error when we try to load any extension after bound', async () => {
  // Arrange
  const loader = new ExtensionLoader({} as any);
  const container = new Container();
  loader.bindExtensions(container.bind.bind(container));

  // Act, Assert
  await expect(loader.loadExternalExtensionModules()).rejects.toThrow(
    'We must load all extensions before call bindExtension function'
  );
  expect(() => loader.loadInternalExtensionModule([])).toThrow(
    'We must load all extensions before call bindExtension function'
  );
});

it('Extension loader should reject external extensions without extending a proper class', async () => {
  // Arrange
  const loader = new ExtensionLoader({
    extensions: {
      test: [path.resolve(__dirname, 'test-extension', 'withoutExtends')],
    },
  } as any);

  // Act, Assert
  await expect(loader.loadExternalExtensionModules()).rejects.toThrow(
    'Extension must have @VulcanExtension decorator, have you use extend the correct super class?'
  );
});

it('Extension loader should reject internal extensions without @VulcanInternalExtension decorator', async () => {
  // Arrange
  const loader = new ExtensionLoader({} as any);

  // Act, Assert
  expect(() => loader.loadInternalExtensionModule([Test3])).toThrow(
    'Internal extension must have @VulcanInternalExtension decorator'
  );
});

it('Extension loader should inject correct config to extensions', async () => {
  // Arrange
  const loader = new ExtensionLoader({
    test1: {
      a: 1,
    },
    test2: {
      b: 2,
    },
  } as any);
  const container = new Container();

  // Act
  loader.loadInternalExtensionModule([Test1, Test2]);
  loader.bindExtensions(container.bind.bind(container));
  const config1 = container
    .getAll<Test1>(TYPES.Extension_TemplateEngine)[0]
    .obtainConfig();
  const config2 = container
    .getAll<Test2>(TYPES.Extension_TemplateEngine)[1]
    .obtainConfig();

  // Assert
  expect(config1).toEqual({ a: 1 });
  expect(config2).toEqual({ b: 2 });
});
