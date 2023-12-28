import { Decorator } from './decorator';
import { Jsonable } from './interface/jsonable';

export interface RawSchema {
  reserved: string;
  name: string;
  decorators: decorator[];
  body: RawBody[];
}

export interface RawBody {
  key: string;
  value: string;
  symbols: string[];
  decorators: decorator[];
}

export interface decorator {
  key: string;
  value: string;
}

export const retriveDecorator = (decorators: Decorator[], key: string) => {
  return decorators.find((decorator) => decorator.key === key);
};

export abstract class Base {
  public reserved;
  public name;
  public decorators;
  public body;

  constructor({ reserved, name, decorators, body }: RawSchema) {
    this.reserved = reserved;
    this.name = name;
    this.decorators = this.parseDecorators(decorators);
    this.body = this.parseBody<Jsonable>(body);
  }

  abstract parseBody<Jsonable>(body: any): Jsonable[];

  private parseDecorators(decorators: decorator[]) {
    return decorators.map(
      (decorator) => new Decorator(decorator.key, decorator.value)
    );
  }
}
