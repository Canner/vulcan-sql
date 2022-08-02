import { Container as InversifyContainer } from 'inversify';
import { Container as CoreContainer } from '@vulcan-sql/core';
import { IBuildOptions } from '@vulcan-sql/build/models';
import { schemaParserModule } from './modules';

export class Container {
  private inversifyContainer?: InversifyContainer;
  private coreContainer?: CoreContainer;

  public get<T>(type: symbol) {
    const instance = this.inversifyContainer?.get<T>(type);
    if (!instance)
      throw new Error(`Cannot resolve ${type.toString()} in container`);
    return instance;
  }

  public async load(options: IBuildOptions) {
    this.coreContainer = new CoreContainer();
    await this.coreContainer.load(options);
    this.inversifyContainer = this.coreContainer.getInversifyContainer();
    this.inversifyContainer.load(schemaParserModule(options.schemaParser));
  }

  public async unload() {
    await this.coreContainer?.unload();
    await this.inversifyContainer?.unbindAllAsync();
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
