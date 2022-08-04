import { TYPES } from '@vulcan-sql/core/types';
import { ExtensionBase } from './base';
import { VulcanExtension } from './decorators';

@VulcanExtension(TYPES.Extension_Serializer, { enforcedId: true })
export abstract class Serializer<T> extends ExtensionBase {
  abstract serialize(data: T): Buffer;
  abstract deserialize(raw: Buffer): T;
}
