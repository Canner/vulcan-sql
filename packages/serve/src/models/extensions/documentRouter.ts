import {
  ArtifactBuilder,
  BuiltInArtifactKeys,
  DocumentSpec,
  ExtensionBase,
  VulcanExtension,
} from '@vulcan-sql/core';
import { TYPES } from '@vulcan-sql/serve/types';
import { KoaContext, Next } from '@vulcan-sql/serve/models';
import { TYPES as CORE_TYPES } from '@vulcan-sql/core';
import { inject } from 'inversify';

@VulcanExtension(TYPES.Extension_DocumentRouter, { enforcedId: true })
export abstract class DocumentRouter<C = any> extends ExtensionBase<C> {
  private artifactBuilder: ArtifactBuilder;

  constructor(
    @inject(CORE_TYPES.ExtensionConfig) config: any,
    @inject(CORE_TYPES.ExtensionName) moduleName: string,
    @inject(CORE_TYPES.ArtifactBuilder) artifactBuilder: ArtifactBuilder
  ) {
    super(config, moduleName);
    this.artifactBuilder = artifactBuilder;
  }

  public abstract handle(context: KoaContext, next: Next): Promise<void>;

  protected async getSpec(type: string = DocumentSpec.oas3) {
    return this.artifactBuilder.getArtifact(BuiltInArtifactKeys.Specs)[type];
  }
}
