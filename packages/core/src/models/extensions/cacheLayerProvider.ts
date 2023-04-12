import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';
import { TYPES } from '@vulcan-sql/core/types';

export interface CacheFileInfo {
  // The relative path of the folder path in data cache options
  name: string;
  [field: string]: any;
}

@VulcanExtension(TYPES.Extension_CacheLayerProvider, { enforcedId: true })
export abstract class CacheLayerProvider<C = any> extends ExtensionBase<C> {
  abstract getFiles(): AsyncGenerator<CacheFileInfo>;
}
