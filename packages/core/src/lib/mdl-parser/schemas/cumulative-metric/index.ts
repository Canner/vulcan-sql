import { Jsonable } from '../interface/jsonable';
import {
  Base,
  RawBody,
  RawSchema,
  decorator,
  retriveDecorator,
} from '../utils';

export interface CumulativeMeasureJSON {
  name: string;
  type: string;
  operator: string;
  refColumn: string;
}

export interface CumulativeWindowJSON {
  name: string;
  refColumn: string;
  timeUnit: string;
  start: string;
  end: string;
}

export interface CumulativeMetricJSON {
  name: string;
  description?: string;
  baseObject: string;
  cached?: boolean;
  refreshTime?: string;
  measure: CumulativeMeasureJSON;
  window: CumulativeWindowJSON;
}

export class CumulativeMetric extends Base implements Jsonable {
  public baseObject = '';
  public cached = false;
  public refreshTime = '';
  public measure: CumulativeMeasureJSON = {} as CumulativeMeasureJSON;
  public window: CumulativeWindowJSON = {} as CumulativeWindowJSON;

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

    const cachedDecorator = this.getDecoratorByKey('cached');
    if (cachedDecorator) {
      this.cached = true;
      this.refreshTime = cachedDecorator.value;
    }

    this.body = this.parseBody<Jsonable>(schema.body);
  }

  public parseBody<Type>(body: any): Type[] {
    const rawMeasures = body.filter(
      (item: RawBody) => hasDecorator(item.decorators, 'measure') === true
    );
    this.measure = rawMeasures.map((item: RawBody) => {
      const measureDecoratorValue = retriveDecorator(
        item.decorators,
        'measure'
      )!.value;
      const { operator, refColumn } = this.parseMeasureValue(
        measureDecoratorValue
      );

      return {
        name: item.key,
        type: item.value,
        operator,
        refColumn,
      };
    })[0];

    const rawWindows = body.filter(
      (item: RawBody) => hasDecorator(item.decorators, 'window') === true
    );
    this.window = rawWindows.map((item: RawBody) => {
      const windowDecoratorValue = retriveDecorator(
        item.decorators,
        'window'
      )!.value;
      const { refColumn, timeUnit, start, end } =
        this.parseWindowValue(windowDecoratorValue);
      return {
        name: item.key,
        refColumn,
        timeUnit,
        start,
        end,
      };
    })[0];

    return [];
  }

  public toJSON(): CumulativeMetricJSON {
    const json = {
      name: this.name,
      baseObject: this.baseObject,
      measure: this.measure,
      window: this.window,
    } as CumulativeMetricJSON;

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

  private parseMeasureValue(call: string): {
    operator: string;
    refColumn: string;
  } {
    const match = call.match(/(\w+)\((\w+)\)/);
    if (match) {
      return {
        operator: match[1],
        refColumn: match[2],
      };
    }
    throw new Error('Invalid function call format');
  }

  private parseWindowValue(call: string): {
    refColumn: string;
    timeUnit: string;
    start: string;
    end: string;
  } {
    const values = call.split(',');
    if (values.length === 4) {
      return {
        refColumn: values[0].replace(/['"]/g, '').trim(),
        timeUnit: values[1].replace(/['"]/g, '').trim(),
        start: values[2].replace(/['"]/g, '').trim(),
        end: values[3].replace(/['"]/g, '').trim(),
      };
    }

    throw new Error('Invalid window call format');
  }
}

function hasDecorator(decorators: decorator[], key: string) {
  return decorators.some((decorator) => decorator.key === key);
}
