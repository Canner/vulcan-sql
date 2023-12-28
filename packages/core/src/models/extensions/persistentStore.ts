import { TYPES } from '@vulcan-sql/core/types';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

@VulcanExtension(TYPES.Extension_PersistentStore, { enforcedId: true })
export abstract class PersistentStore<C = any> extends ExtensionBase<C> {
  abstract save(data: Buffer): Promise<void>;
  abstract load(): Promise<Buffer>;
}
