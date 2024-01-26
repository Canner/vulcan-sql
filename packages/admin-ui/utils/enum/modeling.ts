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
  VIEW = 'view',
  RELATION = 'relation',
  FIELD = 'field',
  CACULATED_FIELD = 'calculatedField',
}

export enum CACHED_PERIOD {
  DAY = 'd',
  HOUR = 'h',
  MINUTE = 'm',
  SECOND = 's',
}

export enum MODEL_STEP {
  ONE = '1',
  TWO = '2',
}
