import { ICoreOptions } from '@vulcan-sql/core/models';
import { Container as InversifyContainer } from 'inversify';
import {
  artifactBuilderModule,
  executorModule,
  templateEngineModule,
  validatorLoaderModule,
} from './modules';

export class Container {
  private inversifyContainer = new InversifyContainer();

  public get<T>(type: symbol) {
    return this.inversifyContainer.get<T>(type);
  }

  public async load(options: ICoreOptions) {
    this.inversifyContainer.load(artifactBuilderModule(options.artifact));
    await this.inversifyContainer.loadAsync(executorModule());
    await this.inversifyContainer.loadAsync(
      templateEngineModule(options.template, options.extensions || [])
    );
    await this.inversifyContainer.loadAsync(
      validatorLoaderModule(options.extensions)
    );
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
