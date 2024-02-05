export enum JOIN_TYPE {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
  ONE_TO_ONE = 'ONE_TO_ONE',
}

export enum METRIC_TYPE {
  DIMENSION = 'dimension',
  MEASURE = 'measure',
  TIME_GRAIN = 'timeGrain',
}

export enum NODE_TYPE {
  MODEL = 'model',
  METRIC = 'metric',
}

export enum MARKER_TYPE {
  MANY = 'many',
  ONE = 'one',
}

export enum EDGE_TYPE {
  STEP = 'step',
  SMOOTHSTEP = 'smoothstep',
  BEZIER = 'bezier',
  MODEL = 'model',
  METRIC = 'metric',
}

export interface PayloadData {
  catalog: string;
  schema: string;
  models: Model[];
  metrics: Metric[];
  relationships: Relationship[];
}

export interface Model {
  id: string;
  nodeType: NODE_TYPE | string;
  name: string;
  description?: string;
  refSql: string;
  columns: ModelColumn[];
}

export interface ModelColumn {
  id: string;
  name: string;
  type: string;
  expression?: string;
  relationship?: Relationship;
  isPrimaryKey: boolean;
}

export interface Relationship {
  name: string;
  models: string[];
  joinType: JOIN_TYPE | string;
  condition: string;
}

export type MetricColumn = {
  id: string;
  name: string;
  type: string;
  metricType: METRIC_TYPE | string;
} & Partial<Dimension & Measure & TimeGrain>;

export interface Metric {
  id: string;
  nodeType: NODE_TYPE | string;
  name: string;
  description?: string;
  baseModel: string;
  preAggregated: boolean;
  refreshTime: string;
  columns: MetricColumn[];
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

export interface MoreClickPayload {
  title: string;
  data: Model | Metric;
}
