import { Container as InversifyContainer } from 'inversify';
import { Container as CoreContainer } from '@vulcan/core';
import { IBuildOptions } from '@vulcan/build/models';
import { schemaParserModule } from './modules';

export class Container {
  private inversifyContainer = new InversifyContainer();

  public get<T>(type: symbol) {
    return this.inversifyContainer.get<T>(type);
  }

  public load(options: IBuildOptions) {
    const coreContainer = new CoreContainer();
    coreContainer.load(options);
    this.inversifyContainer.parent = coreContainer.getInversifyContainer();
    this.inversifyContainer.load(schemaParserModule(options.schemaParser));
  }

  public unload() {
    this.inversifyContainer.parent?.unbindAll();
    this.inversifyContainer.unbindAll();
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
