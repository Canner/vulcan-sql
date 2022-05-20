import { PersistentStore } from './persistentStore';
import { promises as fs } from 'fs';
import { injectable, inject } from 'inversify';
import { TYPES } from '@vulcan/core/containers';
import { IArtifactBuilderOptions } from '@vulcan/core/models';

@injectable()
export class LocalFilePersistentStore implements PersistentStore {
  private filePath: string;

  constructor(
    @inject(TYPES.ArtifactBuilderOptions) options: IArtifactBuilderOptions
  ) {
    this.filePath = options.filePath;
  }

  public async save(data: Buffer): Promise<void> {
    await fs.writeFile(this.filePath, data);
  }

  public async load(): Promise<Buffer> {
    return await fs.readFile(this.filePath);
  }
}
