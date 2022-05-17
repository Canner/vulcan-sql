import { ICoreOptions } from '@vulcan/core/models';
import { Container as InversifyContainer } from 'inversify';
import {
  artifactBuilderModule,
  executorModule,
  templateEngineModule,
  validatorModule,
} from './modules';

export class Container {
  private inversifyContainer = new InversifyContainer();

  public get<T>(type: symbol) {
    return this.inversifyContainer.get<T>(type);
  }

  public load(options: ICoreOptions) {
    this.inversifyContainer.load(artifactBuilderModule(options.artifact));
    this.inversifyContainer.load(executorModule());
    this.inversifyContainer.load(templateEngineModule(options.template));
    this.inversifyContainer.load(validatorModule());
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
