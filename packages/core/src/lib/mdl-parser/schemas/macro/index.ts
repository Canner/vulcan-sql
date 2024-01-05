import { Jsonable } from '../interface/jsonable';
import { RawSchema, Base, retriveDecorator } from '../utils';

export interface MacroJSON {
  name: string;
  definition: string;
}

export class Macro extends Base implements Jsonable {
  constructor(schema: RawSchema) {
    super(schema);
  }

  public parseBody<Type>(): Type[] {
    return [];
  }

  public toJSON(): MacroJSON {
    const json = {
      name: this.name,
      definition: this.getDefinition(),
    } as MacroJSON;

    return json;
  }

  private getDefinition(): string {
    const definitionDecorator = this.getDecoratorByKey('definition');

    if (definitionDecorator) {
      return definitionDecorator.value;
    }

    return '';
  }

  private getDecoratorByKey(key: string) {
    return retriveDecorator(this.decorators, key);
  }
}
