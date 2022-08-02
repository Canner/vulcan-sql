import { ExtensionBase, ICoreOptions } from '@vulcan-sql/core/models';
import { interfaces } from 'inversify';
import { ClassType, defaultImport } from '../utils';
import {
  EXTENSION_NAME_METADATA_KEY,
  EXTENSION_TYPE_METADATA_KEY,
} from '../../models/extensions/decorators';
import 'reflect-metadata';
import { TYPES } from '../../containers/types';
import { chain, isArray, values } from 'lodash';

type Extension = ClassType<ExtensionBase>;

export type ExtensionModuleEntry = Extension[] | Record<string, Extension>;

export class ExtensionLoader {
  private extensionRegistry = new Map<
    symbol,
    { name: string; extension: Extension }[]
  >();
  private config: ICoreOptions;
  private bound = false;

  constructor(config: ICoreOptions) {
    this.config = config;
  }

  public async loadExternalExtensionModules() {
    if (this.bound)
      throw new Error(
        `We must load all extensions before call bindExtension function`
      );

    const extensionModules =
      // {moduleA: 'nameA', moduleB: ['nameB', 'nameC']}
      chain(this.config?.extensions || {})
        // [['moduleA', 'nameA'], ['moduleB',['nameB', 'nameC']]]
        .toPairs()
        // [{alias: 'moduleA', path: 'nameA'}, {alias: 'moduleB', path: 'nameB'}, {alias: 'moduleB', path: 'nameC'}]
        .flatMap(([alias, path]) =>
          (typeof path === 'string' ? [path] : path).map((p) => ({
            alias,
            path: p,
          }))
        )
        .value();

    for (const module of extensionModules) {
      const moduleEntry = (
        await defaultImport<ExtensionModuleEntry>(module.path)
      )[0];
      const extensions = this.flattenExtensions(moduleEntry);
      extensions.forEach((extension) =>
        this.loadExtension(module.alias, extension)
      );
    }
  }

  public loadInternalExtensionModule(moduleEntry: ExtensionModuleEntry) {
    if (this.bound)
      throw new Error(
        `We must load all extensions before call bindExtension function`
      );

    const extensions = this.flattenExtensions(moduleEntry);

    for (const extension of extensions) {
      const name = Reflect.getMetadata(EXTENSION_NAME_METADATA_KEY, extension);
      if (name === undefined)
        throw new Error(
          `Internal extension must have @VulcanInternalExtension decorator`
        );
      this.loadExtension(name, extension);
    }
  }

  public bindExtensions(bind: interfaces.Bind) {
    for (const type of this.extensionRegistry.keys()) {
      this.extensionRegistry.get(type)!.forEach(({ name, extension }) => {
        bind(type).to(extension);
        bind(TYPES.ExtensionConfig)
          // Note they we can't bind undefined to container or it throw error while unbinding.
          // https://github.com/inversify/InversifyJS/issues/1462#issuecomment-1202099036
          .toConstantValue(name.length > 0 ? this.config[name] : {})
          .whenInjectedInto(extension);
      });
    }
    this.bound = true;
  }

  private loadExtension(name: string, extension: Extension) {
    const extensionType = Reflect.getMetadata(
      EXTENSION_TYPE_METADATA_KEY,
      extension
    );
    if (!extensionType)
      throw new Error(
        `Extension must have @VulcanExtension decorator, have you use extend the correct super class?`
      );
    if (!this.extensionRegistry.has(extensionType))
      this.extensionRegistry.set(extensionType, []);

    this.extensionRegistry.get(extensionType)!.push({ name, extension });
  }

  private flattenExtensions(moduleEntry: ExtensionModuleEntry): Extension[] {
    if (isArray(moduleEntry)) return moduleEntry;
    return values(moduleEntry);
  }
}
