import { v4 as uuidv4 } from 'uuid';
import {
  JOIN_TYPE,
  METRIC_TYPE,
  NODE_TYPE,
} from '@vulcan-sql/admin-ui/utils/enum';

export interface MDLJson {
  catalog: string;
  schema: string;
  models: Model[];
  relationships: Relationship[];
  metrics: Metric[];
}

export interface Model {
  name: string;
  description?: string;
  refSql: string;
  columns: ModelColumn[];
  primaryKey: string;
}

export interface ModelColumn {
  name: string;
  type: string;
  expression?: string;
  relationship?: string;
}

export interface Relationship {
  name: string;
  models: string[];
  joinType: JOIN_TYPE;
  condition: string;
}

type MetricColumn = Dimension & Measure & TimeGrain;
export interface Metric {
  name: string;
  description?: string;
  baseObject: string;
  preAggregated: boolean;
  refreshTime: string;
  dimension?: Dimension[];
  measure?: Measure[];
  timeGrain?: TimeGrain[];
}

export interface Dimension {
  name: string;
  type: string;
}

export interface Measure {
  name: string;
  type: string;
  expression: string;
}

export interface TimeGrain {
  name: string;
  refColumn: string;
  dateParts: string[];
}

// view model
export class ModelColumnData {
  public id: string;
  public name: string;
  public type: string;
  public relationship?: Relationship;
  public expression?: string;
  public isPrimaryKey: boolean;

  constructor(column: ModelColumn, model: Model, data: MDLJson) {
    this.id = uuidv4();
    this.name = column.name;
    this.type = column.type;
    if (column?.relationship) {
      const relationship = data.relationships.find(
        (item) => item.name === column?.relationship
      );
      this.relationship = relationship;
    }
    if (column?.expression) {
      this.expression = column.expression;
    }
    this.isPrimaryKey = column.name === model.primaryKey;
  }
}

export class ModelData {
  public id: string;
  public readonly nodeType: NODE_TYPE = NODE_TYPE.MODEL;
  public name: string;
  public description: string;
  public refSql: string;
  public columns: ModelColumnData[];
  public relationships: Relationship[];

  constructor(model: Model, data: MDLJson) {
    this.id = uuidv4();
    this.name = model.name;
    this.description = model?.description || '';
    this.refSql = model.refSql;
    this.columns = model.columns
      .map((column) => new ModelColumnData(column, model, data))
      .sort((_, next) => (next.relationship ? -1 : 1));
    this.relationships = data.relationships.filter((relationship) =>
      relationship.models.includes(this.name)
    );
  }
}

export class MetricColumnData {
  public id: string;
  public name: string;
  public type: string;
  public metricType: METRIC_TYPE;
  public expression?: string;
  public refColumn?: string;
  public dateParts?: string[];

  constructor(column: MetricColumn, metricType: METRIC_TYPE) {
    this.id = uuidv4();
    this.name = column.name;
    this.type = column?.type || '';
    this.metricType = metricType;
    this.expression = column?.expression;
    this.refColumn = column?.refColumn;
    this.dateParts = column?.dateParts;
  }
}

export class MetricData {
  public id: string;
  public readonly nodeType: NODE_TYPE = NODE_TYPE.METRIC;
  public name: string;
  public description: string;
  public baseObject: string;
  public preAggregated = false;
  public refreshTime: string = null;
  public columns: MetricColumnData[] = [];

  constructor(metric: Metric) {
    this.id = uuidv4();
    this.name = metric.name;
    this.description = metric?.description || '';
    this.baseObject = metric.baseObject;
    this.preAggregated = metric.preAggregated;
    this.refreshTime = metric.refreshTime;
    for (const metricType of Object.values(METRIC_TYPE)) {
      const columns = metric[metricType] as MetricColumn[];
      for (const column of columns) {
        this.columns.push(new MetricColumnData(column, metricType));
      }
    }
  }
}
