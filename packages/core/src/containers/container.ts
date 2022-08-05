import { ICoreOptions } from '@vulcan-sql/core/models';
import { Container as InversifyContainer } from 'inversify';
import { ProjectOptions } from '../options';
import { extensionModule } from './modules';
import {
  artifactBuilderModule,
  executorModule,
  templateEngineModule,
  validatorLoaderModule,
} from './modules';
import { TYPES } from './types';

export class Container {
  private inversifyContainer = new InversifyContainer();

  public get<T>(type: symbol) {
    return this.inversifyContainer.get<T>(type);
  }

  public async load(options: ICoreOptions) {
    // Project options
    this.inversifyContainer
      .bind(TYPES.ProjectInputOptions)
      .toConstantValue(options);
    this.inversifyContainer.bind(TYPES.ProjectOptions).to(ProjectOptions);

    await this.inversifyContainer.loadAsync(
      artifactBuilderModule(options.artifact)
    );
    await this.inversifyContainer.loadAsync(executorModule());
    await this.inversifyContainer.loadAsync(
      templateEngineModule(options.template)
    );
    await this.inversifyContainer.loadAsync(validatorLoaderModule());
    await this.inversifyContainer.loadAsync(extensionModule(options));
  }

  public async unload() {
    await this.inversifyContainer.unbindAllAsync();
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
