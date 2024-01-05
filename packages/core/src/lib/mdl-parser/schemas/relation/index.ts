import { Jsonable } from '../interface/jsonable';
import { RawSchema, Base, RawBody, retriveDecorator } from '../utils';

export interface RelationJSON {
  name: string;
  description?: string;
  models: string[];
  joinType: string;
  condition: string;
}

export class Relation extends Base implements Jsonable {
  public models: string[] = [];
  public type = '';
  public condition = '';
  public description = '';

  constructor(schema: RawSchema) {
    super(schema);
    this.body = this.parseBody<Jsonable>(schema.body);
  }

  public toJSON() {
    const json = {
      name: this.name,
      models: this.models,
      joinType: this.type,
      condition: this.condition,
    } as RelationJSON;

    if (this.description) {
      json.description = this.description;
    }

    return json;
  }

  public parseBody<Type>(body: any): Type[] {
    const rawModels = body.find((item: RawBody) => item.key === 'models');
    this.models = [...rawModels.value];

    const rawType = body.find((item: RawBody) => item.key === 'type');
    this.type = rawType.value;

    const conditionDecorator = retriveDecorator(this.decorators, 'condition');
    if (conditionDecorator) {
      this.condition = conditionDecorator.value;
    }

    const descriptionDecorator = retriveDecorator(this.decorators, 'desc');
    if (descriptionDecorator) {
      this.description = descriptionDecorator.value;
    }

    return [];
  }
}
