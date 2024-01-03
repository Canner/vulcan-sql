import { Jsonable } from '../interface/jsonable';
import { RawSchema, Base, retriveDecorator } from '../utils';
import { Column, ColumnJSON, ModelColumn } from './column';

export interface ModelJSON {
  name: string;
  baseObject: string;
  cached?: boolean;
  refreshTime?: string;
  description: string;
  refSql: string;
  columns: ColumnJSON[];
  primaryKey?: string;
}

export class Model extends Base implements Jsonable {
  public baseObject = '';

  constructor(schema: RawSchema) {
    super(schema);

    // determine baseObject
    const modelDecorator = this.getDecoratorByKey('model');
    if (modelDecorator) {
      this.baseObject = modelDecorator.value;
    }
    const metricDecorator = this.getDecoratorByKey('metric');
    if (metricDecorator) {
      this.baseObject = metricDecorator.value;
    }
    const cumulativeMetricDecorator =
      this.getDecoratorByKey('cumulative_metric');
    if (cumulativeMetricDecorator) {
      this.baseObject = cumulativeMetricDecorator.value;
    }

    this.body = this.parseBody<Jsonable>(schema.body);
  }

  public parseBody<Type>(body: any): Type[] {
    return body.map((model: ModelColumn) => new Column(model));
  }

  public toJSON(): ModelJSON {
    const json = {
      name: this.name,
      refSql: this.getRefSql(),
      columns: this.body.map((column) => column.toJSON()),
      primaryKey: this.primaryKey,
    } as ModelJSON;

    if (this.baseObject) {
      json.baseObject = this.baseObject;
    }

    if (this.description) {
      json.description = this.description;
    }

    if (this.cached) {
      json.cached = this.cached;
    }

    if (this.cached && this.refreshTime) {
      json.refreshTime = this.refreshTime;
    }

    return json;
  }

  private getRefSql() {
    const sqlDecorator = this.getDecoratorByKey('sql');

    if (sqlDecorator) {
      return sqlDecorator.value;
    }

    return '';
  }

  public get primaryKey() {
    const primary = this.body.find(
      (column) => (column as Column).isPrimary === true
    ) as Column;

    return primary ? primary.key : undefined;
  }

  public get description() {
    const descriptionDecorator = this.getDecoratorByKey('desc');

    if (descriptionDecorator) {
      return descriptionDecorator.value;
    }

    return '';
  }

  public get cached() {
    const cachedDecorator = this.getDecoratorByKey('cached');

    if (cachedDecorator) {
      return true;
    }

    return false;
  }

  public get refreshTime() {
    const cachedDecorator = this.getDecoratorByKey('cached');

    if (cachedDecorator) {
      return cachedDecorator.value;
    }

    return '';
  }

  private getDecoratorByKey(key: string) {
    return retriveDecorator(this.decorators, key);
  }
}
