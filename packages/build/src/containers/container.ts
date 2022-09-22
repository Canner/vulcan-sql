import { Container as InversifyContainer } from 'inversify';
import { Container as CoreContainer } from '@vulcan-sql/core';
import { IBuildOptions } from '@vulcan-sql/build/models';
import {
  documentGeneratorModule,
  extensionModule,
  packagerModule,
  schemaParserModule,
} from './modules';

export class Container {
  private inversifyContainer?: InversifyContainer;
  private coreContainer?: CoreContainer;

  public get<T>(type: symbol) {
    const instance = this.inversifyContainer?.get<T>(type);
    if (!instance)
      throw new Error(`Cannot resolve ${type.toString()} in container`);
    return instance;
  }

  public getAll<T>(type: symbol) {
    const instances = this.inversifyContainer?.getAll<T>(type);
    return instances;
  }

  public async load(options: IBuildOptions) {
    this.coreContainer = new CoreContainer();
    await this.coreContainer.load(options);
    this.inversifyContainer = this.coreContainer.getInversifyContainer();
    await this.inversifyContainer.loadAsync(
      schemaParserModule(options['schema-parser'])
    );
    await this.inversifyContainer.loadAsync(extensionModule(options));
    await this.inversifyContainer.loadAsync(documentGeneratorModule());
    await this.inversifyContainer.loadAsync(packagerModule());
  }

  public async unload() {
    await this.coreContainer?.unload();
    await this.inversifyContainer?.unbindAllAsync();
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
