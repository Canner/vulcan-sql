import { Container as InversifyContainer } from 'inversify';
import { Container as CoreContainer } from '@vulcan/core';
import { routeGeneratorModule } from './modules';
import { ServeConfig } from '../models';

export class Container {
  private inversifyContainer = new InversifyContainer();

  public get<T>(type: symbol) {
    return this.inversifyContainer.get<T>(type);
  }

  public async load(config: ServeConfig) {
    const coreContainer = new CoreContainer();
    await coreContainer.load(config);
    this.inversifyContainer.parent = coreContainer.getInversifyContainer();
    this.inversifyContainer.load(routeGeneratorModule());
  }

  public unload() {
    this.inversifyContainer.parent?.unbindAll();
    this.inversifyContainer.unbindAll();
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
