import {
  Serializer,
  VulcanExtensionId,
  VulcanInternalExtension,
} from '@vulcan-sql/core/models';

@VulcanInternalExtension()
@VulcanExtensionId('JSON')
export class JSONSerializer<T> extends Serializer<T> {
  public serialize(data: T): Buffer {
    return Buffer.from(JSON.stringify(data), 'utf-8');
  }

  public deserialize(raw: Buffer): T {
    return JSON.parse(raw.toString('utf-8')) as T;
  }
}
