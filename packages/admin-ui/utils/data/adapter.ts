import { MDLJson, MetricData, ModelData } from '../data/model';

export interface AdaptedData extends Omit<MDLJson, 'models' | 'metrics'> {
  models: ModelData[];
  metrics: MetricData[];
}

export const adapter = (data: MDLJson): AdaptedData => {
  const { models = [], metrics = [] } = data;
  const adaptModels = models.map((model) => {
    return new ModelData(model, data);
  });
  const adaptMetrics = metrics.map((metric) => {
    return new MetricData(metric);
  });

  return {
    ...data,
    models: adaptModels,
    metrics: adaptMetrics,
  };
};
