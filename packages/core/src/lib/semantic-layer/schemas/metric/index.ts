import { Jsonable } from '../interface/jsonable';
import {
  Base,
  RawBody,
  RawSchema,
  decorator,
  retriveDecorator,
} from '../utils';

export interface DimensionJSON {
  name: string;
  description?: string;
  type: string;
  expression?: string;
  isCalculated: boolean;
  notNull: boolean;
}

export interface MeasureJSON {
  name: string;
  description?: string;
  type: string;
  expression: string;
  isCalculated: boolean;
  notNull: boolean;
}

export interface timeGrainJSON {
  name: string;
  description?: string;
  refColumn: string;
  dateParts: string[];
}

export interface MetricJSON {
  name: string;
  description?: string;
  baseObject: string;
  cached?: boolean;
  refreshTime?: string;
  dimension: DimensionJSON[];
  measure: MeasureJSON[];
  timeGrain: timeGrainJSON[];
}

export class Metric extends Base implements Jsonable {
  public baseObject = '';
  public cached = false;
  public refreshTime = '';
  public dimension: DimensionJSON[] = [];
  public measure: MeasureJSON[] = [];
  public timeGrain: timeGrainJSON[] = [];

  constructor(schema: RawSchema) {
    super(schema);

    const modelDecorator = this.getDecoratorByKey('model');
    if (modelDecorator) {
      this.baseObject = modelDecorator.value;
    }

    const cachedDecorator = this.getDecoratorByKey('cached');
    if (cachedDecorator) {
      this.cached = true;
      this.refreshTime = cachedDecorator.value;
    }

    this.body = this.parseBody<Jsonable>(schema.body);
  }

  public parseBody<Type>(body: any): Type[] {
    const rawDimensions = body.filter(
      (item: RawBody) => hasDecorator(item.decorators, 'dim') === true
    );
    this.dimension = rawDimensions.map((item: RawBody) => {
      const dimDecorator = retriveDecorator(item.decorators, 'dim')!;
      const descDecorator = retriveDecorator(item.decorators, 'desc');
      const isCalculatedDecorator = retriveDecorator(item.decorators, 'calc');

      const json = {
        name: item.key,
        type: item.value,
        isCalculated: isCalculatedDecorator?.value ? true : false,
        notNull: item.symbols.includes('!') ? true : false,
      } as DimensionJSON;

      if (dimDecorator.value) {
        json.expression = dimDecorator.value;
      }

      if (descDecorator) {
        json.description = descDecorator.value;
      }

      return json;
    });

    const rawMeasures = body.filter(
      (item: RawBody) => hasDecorator(item.decorators, 'measure') === true
    );
    this.measure = rawMeasures.map((item: RawBody) => {
      const measureDecorator = retriveDecorator(item.decorators, 'measure')!;
      const descDecorator = retriveDecorator(item.decorators, 'desc');
      const isCalculatedDecorator = retriveDecorator(item.decorators, 'calc');

      const json = {
        name: item.key,
        type: item.value,
        expression: measureDecorator.value,
        isCalculated: isCalculatedDecorator?.value ? true : false,
        notNull: item.symbols.includes('!') ? true : false,
      } as MeasureJSON;

      if (descDecorator) {
        json.description = descDecorator.value;
      }

      return json;
    });

    const rawTimeGrains = body.filter(
      (item: RawBody) => hasDecorator(item.decorators, 'time_grain') === true
    );
    this.timeGrain = rawTimeGrains.map((item: RawBody) => {
      const timeGrainDecorator = retriveDecorator(
        item.decorators,
        'time_grain'
      )!;
      const descDecorator = retriveDecorator(item.decorators, 'desc');
      const [refColumn, ...restDatePart] = timeGrainDecorator.value.split(',');
      const dateParts = restDatePart
        .join(',')
        .replace(/[[\]\s]/g, '')
        .split(',');
      const json = {
        name: item.key,
        refColumn,
        dateParts,
      } as timeGrainJSON;

      if (descDecorator) {
        json.description = descDecorator.value;
      }

      return json;
    });

    return [];
  }

  public toJSON() {
    const json = {
      name: this.name,
      baseObject: this.baseObject,
      dimension: this.dimension,
      measure: this.measure,
      timeGrain: this.timeGrain,
    } as MetricJSON;

    if (this.cached) {
      json.cached = this.cached;
    }

    if (this.refreshTime) {
      json.refreshTime = this.refreshTime;
    }

    if (this.description) {
      json.description = this.description;
    }

    return json;
  }

  public get description() {
    return this.getDecoratorByKey('desc')?.value;
  }

  private getDecoratorByKey(key: string) {
    return retriveDecorator(this.decorators, key);
  }
}

function hasDecorator(decorators: decorator[], key: string) {
  return decorators.some((decorator) => decorator.key === key);
}
