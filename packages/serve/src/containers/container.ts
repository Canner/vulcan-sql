import { Container as InversifyContainer } from 'inversify';
import { Container as CoreContainer, InternalError } from '@vulcan-sql/core';
import {
  applicationModule,
  documentRouterModule,
  evaluationModule,
  extensionModule,
  routeGeneratorModule,
} from './modules';
import { ServeConfig } from '../models';

export class Container {
  private inversifyContainer?: InversifyContainer;
  private coreContainer?: CoreContainer;

  public get<T>(type: symbol) {
    const instance = this.inversifyContainer?.get<T>(type);
    if (!instance)
      throw new InternalError(`Cannot resolve ${type.toString()} in container`);
    return instance;
  }

  public getAll<T>(type: symbol) {
    const instances = this.inversifyContainer?.getAll<T>(type);
    return instances;
  }

  public async load(config: ServeConfig) {
    this.coreContainer = new CoreContainer();
    await this.coreContainer.load(config);
    this.inversifyContainer = this.coreContainer.getInversifyContainer();
    this.inversifyContainer.load(routeGeneratorModule());
    await this.inversifyContainer.loadAsync(extensionModule(config));
    await this.inversifyContainer.loadAsync(applicationModule());
    await this.inversifyContainer.loadAsync(documentRouterModule());
    await this.inversifyContainer.loadAsync(evaluationModule());
  }

  public async unload() {
    await this.coreContainer?.unload();
    await this.inversifyContainer?.unbindAllAsync();
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
