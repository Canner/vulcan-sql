export enum CacheLayerProviderType {
  LocalFile = 'LocalFile',
}

export enum CacheLayerStoreFormatType {
  Parquet = 'Parquet',
}

export enum CacheLayerStoreLoaderType {
  DuckDB = 'DuckDB',
}

export interface ICacheLayerOptions {
  /** The provider which provides the content of our cache files. e.g. LocalFile provider to save built result in local disk. */
  provider?: CacheLayerProviderType | string;
  folderPath?: string;
  loader?: CacheLayerStoreLoaderType | string;
}

// The cache layer profile name is used to load the cache data to table name from cache files
export const cacheProfileName = 'vulcan.cache';

// The schema name for vulcan used to create table when loading parquet files to cache data source
export const vulcanCacheSchemaName = 'vulcan';
