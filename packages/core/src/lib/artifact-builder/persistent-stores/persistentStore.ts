export interface PersistentStore {
  save(data: Buffer): Promise<void>;
  load(): Promise<Buffer>;
}
