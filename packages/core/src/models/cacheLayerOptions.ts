import { tmpdir } from 'os';
import * as path from 'path';

export enum CacheLayerStoreFormatType {
  parquet = 'parquet',
}

export enum CacheLayerStoreLoaderType {
  duckdb = 'duckdb',
}

export interface ICacheLayerOptions {
  // export & import file type
  type?: CacheLayerStoreFormatType | string;
  folderPath?: string;
  loader?: CacheLayerStoreLoaderType | string;
}

// The cache layer profile name is used to load the cache data to table name from cache files
export const cacheProfileName = 'vulcan.cache';

// The schema name for vulcan used to create table when loading cache files to cache data source
export const vulcanCacheSchemaName = 'vulcan';

// The default folder path to store the cache files
// The path.resolve(tmpdir(), 'vulcan') could be the root if other places also need to create temp folder default in the future.
export const defaultCacheLayerFolderPath = path.resolve(
  tmpdir(),
  'vulcan',
  'cache'
);
