import { Manifest } from '@vulcan-sql/admin-ui/utils/data/type';
import { MetricData, ModelData } from '@vulcan-sql/admin-ui/utils/data/model';

export interface AdaptedData extends Omit<Manifest, 'models' | 'metrics'> {
  models: ModelData[];
  metrics: MetricData[];
}

export const adapter = (data: Manifest): AdaptedData => {
  const { models = [], metrics = [], cumulativeMetrics = [] } = data;
  const adaptModels = models.map((model) => {
    return new ModelData(model, data);
  });
  const adaptMetrics = [...metrics, ...cumulativeMetrics].map((metric) => {
    // cumulative metric has window property
    return new MetricData(metric, !!metric.window);
  });

  return {
    ...data,
    models: adaptModels,
    metrics: adaptMetrics,
  };
};
