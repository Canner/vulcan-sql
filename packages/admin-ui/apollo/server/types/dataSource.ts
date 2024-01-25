export enum DataSourceName {
  BIG_QUERY = 'BigQuery',
}

export interface DataSource {
  name: DataSourceName;
  requiredProperties: string[];
}
