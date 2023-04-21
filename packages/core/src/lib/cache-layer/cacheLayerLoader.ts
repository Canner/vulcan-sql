import * as path from 'path';
import * as fs from 'fs';
import { inject, injectable, interfaces } from 'inversify';
import { TYPES } from '@vulcan-sql/core/types';
import {
  ICacheLayerOptions,
  cacheProfileName,
  vulcanCacheSchemaName,
} from '@vulcan-sql/core/models';
import { CacheLayerOptions } from '@vulcan-sql/core/options';
import { APISchema, DataSource } from '@vulcan-sql/core/models';

export interface ICacheLayerLoader {
  preload(schemas: Array<APISchema>, cacheProfile: string): Promise<void>;
}

@injectable()
export class CacheLayerLoader implements ICacheLayerLoader {
  // Use protected method for unit test
  protected dataSourceFactory: interfaces.SimpleFactory<DataSource>;
  private options: ICacheLayerOptions;

  constructor(
    @inject(TYPES.CacheLayerOptions) options: CacheLayerOptions,
    @inject(TYPES.Factory_DataSource)
    dataSourceFactory: interfaces.SimpleFactory<DataSource>
  ) {
    this.dataSourceFactory = dataSourceFactory;
    this.options = options;
  }

  /**
   * Preload the cache files to cache data source and created tables
   * @param schemas The API schemas from artifact to preload
   */
  public async preload(schemas: Array<APISchema>): Promise<void> {
    // prepare cache data source
    const cacheStorage = this.dataSourceFactory(cacheProfileName);
    // traverse each cache table of each schema
    for (const schema of schemas) {
      schema.cache?.map(async (cache) => {
        const { cacheTableName, sql, profile } = cache;
        const dataSource = this.dataSourceFactory(profile);
        // filename pattern: [schema.templateSource]#[profileName]#[cacheTableName].parquet
        const filepath = this.generateFilePath(
          schema.templateSource,
          profile,
          cacheTableName
        );
        if (!fs.existsSync(this.options.folderPath!))
          fs.mkdirSync(this.options.folderPath!);

        // 1. export to cache files according to each schema set the cache value
        await dataSource.export({
          sql,
          filepath,
          profileName: profile,
          type: this.options.type!,
        });

        // 2. preload the files to cache data source
        await cacheStorage.import({
          tableName: cacheTableName,
          filepath,
          // use the "cache-layer" profile to import the cache data
          profileName: cacheProfileName,
          // default schema name for cache layer
          schema: vulcanCacheSchemaName,
          type: this.options.type!,
        });
      });
    }
  }

  /**
   * generate the file path for cache file path to export
   * filename pattern: [templateSource]#[profileName]#[cacheTableName].parquet
   * @param templateSource The template source name
   * @param profileName The profile name
   * @param cacheTableName The cache table name
   */
  private generateFilePath(
    templateSource: string,
    profileName: string,
    cacheTableName: string
  ) {
    // replace the '/' tp '_' to avoid the file path issue for templateSource
    const templateName = templateSource.replace('/', '_');
    const filename = `${templateName}#${profileName}#${cacheTableName}.parquet`;
    const filepath = path
      .join(this.options.folderPath!, filename)
      // support the windows OS path
      .split(path.sep)
      .join('/');
    return filepath;
  }
}
