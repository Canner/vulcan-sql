import { IGlobalOptions } from '@models';
import { Container as InversifyContainer } from 'inversify';
import {
  artifactBuilderModule,
  executorModule,
  templateEngineModule,
} from './modules';

export class Container {
  private inversifyContainer = new InversifyContainer();

  public get<T>(type: symbol) {
    return this.inversifyContainer.get<T>(type);
  }

  public load(options: IGlobalOptions) {
    this.inversifyContainer.load(artifactBuilderModule(options.artifact));
    this.inversifyContainer.load(executorModule());
    this.inversifyContainer.load(templateEngineModule(options.template));
  }
}
