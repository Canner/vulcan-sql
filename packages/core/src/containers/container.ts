import { ICoreOptions } from '@vulcan-sql/core/models';
import { Container as InversifyContainer } from 'inversify';
import { ProfileLoader } from '..';
import { ProjectOptions } from '../options';
import { documentModule, extensionModule, profilesModule } from './modules';
import {
  artifactBuilderModule,
  cacheLayerModule,
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
    await this.inversifyContainer.loadAsync(profilesModule(options.profiles));
    await this.inversifyContainer.loadAsync(
      templateEngineModule(options.template)
    );
    await this.inversifyContainer.loadAsync(validatorLoaderModule());
    await this.inversifyContainer.loadAsync(extensionModule(options));
    await this.inversifyContainer.loadAsync(documentModule(options.document));
    // executor module depends on extensionModule and profileModule.
    const profileLoader = this.inversifyContainer.get<ProfileLoader>(
      TYPES.ProfileLoader
    );
    const profiles = await profileLoader.getProfiles();
    await this.inversifyContainer.loadAsync(executorModule(profiles));

    await this.inversifyContainer.loadAsync(
      cacheLayerModule(options['cache-layer'])
    );
  }

  public async unload() {
    await this.inversifyContainer.unbindAllAsync();
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
