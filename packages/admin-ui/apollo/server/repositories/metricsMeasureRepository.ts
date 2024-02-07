import { Knex } from 'knex';
import { BaseRepository, IBasicRepository } from './baseRepository';

export interface MetricsMeasure {
  id: number; // ID
  metricsId: number; // Reference to metrics ID
  name: string; // Measure name
  expression: string; // Expression for the measure
  granularity?: string; // Granularity for the measure, eg: "day", "hour", "minute", "year"
}

export interface IMetricsMeasureRepository
  extends IBasicRepository<MetricsMeasure> {}

export class MetricsMeasureRepository extends BaseRepository<MetricsMeasure> {
  constructor(knexPg: Knex) {
    super({ knexPg, tableName: 'metrics_measure' });
  }
}
