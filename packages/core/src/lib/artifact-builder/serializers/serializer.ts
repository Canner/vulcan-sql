export interface Serializer<T> {
  serialize(data: T): Buffer;
  deserialize(raw: Buffer): T;
}
