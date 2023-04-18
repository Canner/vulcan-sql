import { APISchema, ICoreOptions } from '@vulcan-sql/core/models';
import { Container as InversifyContainer } from 'inversify';
import { ArtifactBuilder, BuiltInArtifactKeys, ProfileLoader } from '..';
import { ProjectOptions } from '../options';
import { documentModule, extensionModule, profilesModule } from './modules';
import {
  artifactBuilderModule,
  cacheLayerModule,
  dataSourceModule,
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

    // data source module depends on extensionModule and profileModule.
    const profileLoader = this.inversifyContainer.get<ProfileLoader>(
      TYPES.ProfileLoader
    );
    const profiles = await profileLoader.getProfiles();

    await this.inversifyContainer.loadAsync(
      dataSourceModule(profiles, options.cache)
    );
    await this.inversifyContainer.loadAsync(executorModule());
    await this.inversifyContainer.loadAsync(cacheLayerModule(options.cache));
  }

  public async unload() {
    await this.inversifyContainer.unbindAllAsync();
  }

  public getInversifyContainer() {
    return this.inversifyContainer;
  }
}
