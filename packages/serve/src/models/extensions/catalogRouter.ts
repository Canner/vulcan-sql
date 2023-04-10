import {
  APISchema,
  BuiltInArtifactKeys,
  ExtensionBase,
  ICoreOptions,
  VulcanArtifactBuilder,
  VulcanExtension,
} from '@vulcan-sql/core';
import { TYPES } from '@vulcan-sql/serve/types';
import { KoaContext, Next } from '@vulcan-sql/serve/models';
import { TYPES as CORE_TYPES } from '@vulcan-sql/core';
import { inject } from 'inversify';

@VulcanExtension(TYPES.Extension_CatalogRouter)
export abstract class CatalogRouter<C = any> extends ExtensionBase<C> {
  private projectOptions: ICoreOptions;
  private artifactBuilder: VulcanArtifactBuilder;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) moduleName: string,
    @inject(CORE_TYPES.ProjectOptions) projectOptions: ICoreOptions,
    @inject(CORE_TYPES.ArtifactBuilder) artifactBuilder: VulcanArtifactBuilder
  ) {
    super(config, moduleName);
    this.projectOptions = projectOptions;
    this.artifactBuilder = artifactBuilder;
  }

  public abstract handle(context: KoaContext, next: Next): Promise<void>;

  protected getOptions() {
    return this.projectOptions;
  }

  protected async getArtifactSchemas() {
    return await this.artifactBuilder.getArtifact<APISchema[]>(BuiltInArtifactKeys.Schemas)
  }
}
