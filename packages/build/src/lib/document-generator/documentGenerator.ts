import {
  APISchema,
  DocumentOptions,
  TYPES as CORE_TYPES,
} from '@vulcan-sql/core';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '../../containers/types';
import { SpecGenerator } from '../../models/extensions';
import * as jsYAML from 'js-yaml';
import * as path from 'path';
import { promises as fs } from 'fs';

@injectable()
export class DocumentGenerator {
  private specGenerators: SpecGenerator[];
  private folderPath: string;

  constructor(
    @inject(TYPES.Factory_SpecGenerator)
    specGeneratorFactory: interfaces.AutoNamedFactory<SpecGenerator>,
    @inject(CORE_TYPES.DocumentOptions) options: DocumentOptions
  ) {
    this.specGenerators = [];
    for (const spec of options.specs) {
      this.specGenerators.push(specGeneratorFactory(spec));
    }
    this.folderPath = options.folderPath;
  }

  public async generateDocuments(schemas: APISchema[]) {
    for (const generator of this.specGenerators) {
      const spec = generator.getSpec(schemas);
      const filePath = path.resolve(
        this.folderPath,
        `spec-${generator.getExtensionId()}.yaml`
      );
      await fs.writeFile(filePath, jsYAML.dump(spec), 'utf-8');
    }
  }
}
