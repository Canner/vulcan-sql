import { PersistentStore } from './persistentStore';
import { promises as fs } from 'fs';

export class LocalFilePersistentStore implements PersistentStore {
  private filePath: string;

  constructor({ filePath }: { filePath: string }) {
    this.filePath = filePath;
  }

  public async save(data: Buffer): Promise<void> {
    await fs.writeFile(this.filePath, data);
  }

  public async load(): Promise<Buffer> {
    return await fs.readFile(this.filePath);
  }
}
