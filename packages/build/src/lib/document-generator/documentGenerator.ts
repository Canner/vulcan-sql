import {
  APISchema,
  ArtifactBuilder,
  BuiltInArtifactKeys,
  DocumentOptions,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/api-layer';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '../../containers/types';
import { SpecGenerator } from '../../models/extensions';

@injectable()
export class DocumentGenerator {
  private specGenerators: SpecGenerator[];
  private artifactBuilder: ArtifactBuilder;

  constructor(
    @inject(TYPES.Factory_SpecGenerator)
    specGeneratorFactory: interfaces.AutoNamedFactory<SpecGenerator>,
    @inject(CORE_TYPES.DocumentOptions) options: DocumentOptions,
    @inject(CORE_TYPES.ArtifactBuilder) artifactBuilder: ArtifactBuilder
  ) {
    this.specGenerators = [];
    for (const spec of options.specs) {
      this.specGenerators.push(specGeneratorFactory(spec));
    }
    this.artifactBuilder = artifactBuilder;
  }

  public async generateDocuments(schemas: APISchema[]) {
    const specs: Record<string, any> = {};
    for (const generator of this.specGenerators) {
      specs[generator.getExtensionId()!] = generator.getSpec(schemas);
    }
    this.artifactBuilder.addArtifact(BuiltInArtifactKeys.Specs, specs);
  }
}
