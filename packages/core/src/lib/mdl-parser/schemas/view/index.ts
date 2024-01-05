import { Jsonable } from '../interface/jsonable';
import { RawSchema, RawBody } from '../utils';

export interface ViewJSONRow {
  name: string;
  statement: string;
}

export class View implements Jsonable {
  public body: ViewJSONRow[];

  constructor(schema: RawSchema) {
    this.body = this.parseBody(schema.body);
  }

  public parseBody(body: RawBody[]) {
    return body.map((row) => ({
      name: row.key,
      statement: row.value.replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' '),
    }));
  }

  public toJSON() {
    return this.body;
  }
}
