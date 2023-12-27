import { RawSchema } from '../utils';
import { get, set } from 'lodash';

export class Config {
  constructor(schema: RawSchema) {
    schema.body.map(({ key, value }) => set(this, key, value));
  }

  public get(key: string): any {
    return get(this, key);
  }
}
