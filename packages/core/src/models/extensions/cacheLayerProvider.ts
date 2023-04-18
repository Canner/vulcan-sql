import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';
import { TYPES } from '@vulcan-sql/core/types';

export interface CacheFileInfo {
  // The file name, e.g: file.txt
  name: string;
  // The file path base on the "cache" config set "folderPath"
  // e.g: folderPath = textFiles, file name is "file.txt", path = textFiles/file.txt
  path: string;
  [field: string]: any;
}

@VulcanExtension(TYPES.Extension_CacheLayerProvider, { enforcedId: true })
export abstract class CacheLayerProvider<C = any> extends ExtensionBase<C> {
  abstract getFiles(): AsyncGenerator<CacheFileInfo>;
}
