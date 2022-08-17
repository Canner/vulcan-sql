import { promises as fs } from 'fs';
import {
  ArtifactBuilderProviderType,
  IArtifactBuilderOptions,
  PersistentStore,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';
import { inject } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import { ArtifactBuilderOptions } from '@vulcan-sql/core/options';

@VulcanInternalExtension()
@VulcanExtensionId(ArtifactBuilderProviderType.LocalFile)
export class LocalFilePersistentStore extends PersistentStore {
  private filePath: string;

  constructor(
    @inject(TYPES.ArtifactBuilderOptions) options: ArtifactBuilderOptions,
    @inject(TYPES.ExtensionConfig) config: any,
    @inject(TYPES.ExtensionName) moduleName: string
  ) {
    super(config, moduleName);
    this.filePath = options.filePath;
  }

  public async save(data: Buffer): Promise<void> {
    await fs.writeFile(this.filePath, data);
  }

  public async load(): Promise<Buffer> {
    return await fs.readFile(this.filePath);
  }
}
