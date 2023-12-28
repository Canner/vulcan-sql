import { Decorator } from '../decorator';
import { Jsonable } from '../interface/jsonable';
import { retriveDecorator } from '../utils';

export interface ModelColumn {
  key: string;
  value: string;
  symbols: string[];
  decorators: Decorator[];
}

export interface ColumnJSON {
  name: string;
  type: string;
  isCalculated: boolean;
  notNull: boolean;
  description?: string;
  expression?: string;
  relationship?: string;
}

export class Column implements Jsonable, ModelColumn {
  public key;
  public value;
  public symbols;
  public decorators;

  constructor({ key, value, symbols, decorators }: ModelColumn) {
    this.key = key;
    this.value = value;
    this.symbols = symbols;
    this.decorators = decorators;
  }

  public toJSON() {
    const json: ColumnJSON = {
      name: this.key,
      type: this.value,
      notNull: this.isNotNull,
      isCalculated: this.isCalculated,
    };

    if (this.expression) {
      json.expression = this.expression;
    }

    if (this.relationship) {
      json.relationship = this.relationship;
    }

    if (this.description) {
      json.description = this.description;
    }

    return json;
  }

  public get expression() {
    if (this.isCalculated) {
      return this.getDecoratorByKey('calc')?.value;
    }
    const exprDecorator = this.getDecoratorByKey('expr');
    return exprDecorator ? exprDecorator.value : null;
  }

  public get isPrimary(): boolean {
    return this.getDecoratorByKey('primaryKey') ? true : false;
  }

  public get relationship() {
    const relDecorator = this.getDecoratorByKey('relation');
    return relDecorator ? relDecorator.value : null;
  }

  public get description() {
    const descriptionDecorator = this.getDecoratorByKey('desc');
    return descriptionDecorator ? descriptionDecorator.value : null;
  }

  public get isNotNull(): boolean {
    return this.symbols.includes('!') || this.relationship !== null;
  }

  public get isCalculated(): boolean {
    return this.getDecoratorByKey('calc') ? true : false;
  }

  private getDecoratorByKey(key: string) {
    return retriveDecorator(this.decorators, key);
  }
}
