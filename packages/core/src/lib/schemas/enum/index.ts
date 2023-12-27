import { Jsonable } from '../interface/jsonable';
import { RawSchema, Base } from '../utils';

export interface EnumValueJson {
  name: string;
  value?: string | number;
}

interface bodyWithValue {
  key: string;
  value: string | number;
}

type bodyItem = string | bodyWithValue;

export class Enum extends Base implements Jsonable {
  public enumBody: EnumValueJson[] = [];

  constructor(schema: RawSchema) {
    super(schema);
    this.setBody(schema.body);
  }

  public toJSON() {
    return {
      name: this.name,
      values: this.enumBody,
    };
  }

  public parseBody<Type>(): Type[] {
    return [];
  }

  public setBody(body: bodyItem[]) {
    body.forEach((item) => {
      if (typeof item === 'string') {
        this.enumBody.push({ name: item });
        return;
      }

      this.enumBody.push({ name: item.key, value: item.value });
    });
  }
}
