import { Serializer } from './serializer';
import { injectable } from 'inversify';

@injectable()
export class JSONSerializer<T> implements Serializer<T> {
  public serialize(data: T): Buffer {
    return Buffer.from(JSON.stringify(data), 'utf-8');
  }

  public deserialize(raw: Buffer): T {
    return JSON.parse(raw.toString('utf-8')) as T;
  }
}
